import { z } from 'zod'
import { prisma } from './db'
import { hashApiKey, isApiKeyFormat, isPublicApiKeyFormat, type ApiKeyKind } from './crypto'
import { ApiError } from './errors'
import { clientIp, limits, rateLimit } from './rate-limit'
import { registerActivity } from './activities'
import { FREE_TIER } from './plan'
import type { Project } from '@prisma/client'

const bearerRe = /^Bearer\s+(.+)$/i

export type ApiAuth = {
  project: Project
  apiKeyId: string
  keyType: ApiKeyKind
}

export async function authenticateApiRequest(request: Request): Promise<ApiAuth> {
  const header = request.headers.get('authorization') || ''
  const match = header.match(bearerRe)
  const token = match?.[1]?.trim()
  if (!token) {
    throw new ApiError(401, 'unauthorized', 'Missing Authorization Bearer token.')
  }
  if (!isApiKeyFormat(token)) {
    throw new ApiError(401, 'invalid_api_key', 'API key format is invalid.')
  }

  const ip = clientIp(request)
  const spec = isPublicApiKeyFormat(token) ? limits.public : limits.api
  const limited = rateLimit(`api:${hashApiKey(token)}:${ip}`, spec.limit, spec.windowMs)
  if (!limited.ok) {
    throw new ApiError(429, 'rate_limited', 'Too many requests. Slow down and retry.')
  }

  const keyHash = hashApiKey(token)
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { project: true },
  })
  if (!apiKey || apiKey.revokedAt) {
    throw new ApiError(401, 'invalid_api_key', 'API key is invalid or revoked.')
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    project: apiKey.project,
    apiKeyId: apiKey.id,
    keyType: apiKey.type,
  }
}

export function requireSecretApiKey(auth: ApiAuth): void {
  if (auth.keyType !== 'SECRET') {
    throw new ApiError(
      403,
      'forbidden',
      'This operation requires a server API key (lh_live_...). Public iOS keys can only register activities.',
    )
  }
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204 })
}

export const registerActivitySchema = z.object({
  activity_id: z.string().trim().min(1).max(200),
  push_token: z.string().trim().min(16).max(400),
  type: z.string().trim().min(1).max(80).optional(),
  expires_at: z.string().datetime().optional(),
})

export const updateActivitySchema = z.object({
  content_state: z.record(z.string(), z.unknown()),
  alert: z
    .object({
      title: z.string().max(200).optional(),
      body: z.string().max(400).optional(),
      sound: z.string().max(80).optional(),
    })
    .optional(),
  stale_date: z.number().int().optional(),
  relevance_score: z.number().min(0).max(1).optional(),
})

export const endActivitySchema = z.object({
  content_state: z.record(z.string(), z.unknown()).optional(),
  dismissal_date: z.number().int().optional(),
})

export async function readJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError(400, 'invalid_json', 'Request body must be valid JSON.')
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(400, 'invalid_request', 'Request validation failed.', parsed.error.flatten())
  }
  return parsed.data
}

export async function handleActivityRegistration(
  request: Request,
  options: { allowPublic: boolean },
) {
  const auth = await authenticateApiRequest(request)
  if (!options.allowPublic) {
    requireSecretApiKey(auth)
  }

  if (auth.keyType === 'PUBLIC') {
    const ip = clientIp(request)
    const burst = rateLimit(
      `public-register:${auth.project.id}:${ip}`,
      limits.publicRegister.limit,
      limits.publicRegister.windowMs,
    )
    if (!burst.ok) {
      throw new ApiError(429, 'rate_limited', 'Too many registration requests. Slow down and retry.')
    }
  }

  const body = await readJson(request, registerActivitySchema)
  return registerActivity({
    project: auth.project,
    externalActivityId: body.activity_id,
    pushToken: body.push_token,
    type: body.type,
    expiresAt: body.expires_at ? new Date(body.expires_at) : undefined,
    createLimit: auth.keyType === 'PUBLIC' ? FREE_TIER.maxActiveActivities : undefined,
  })
}
