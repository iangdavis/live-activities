import { z } from 'zod'
import { prisma } from './db'
import { hashApiKey, isApiKeyFormat } from './crypto'
import { ApiError } from './errors'
import { clientIp, limits, rateLimit } from './rate-limit'
import type { Project } from '@prisma/client'

const bearerRe = /^Bearer\s+(.+)$/i

export type ApiAuth = {
  project: Project
  apiKeyId: string
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
  const limited = rateLimit(`api:${hashApiKey(token)}:${ip}`, limits.api.limit, limits.api.windowMs)
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

  return { project: apiKey.project, apiKeyId: apiKey.id }
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
