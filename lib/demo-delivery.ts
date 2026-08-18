import { hashApiKey, isApiKeyFormat } from './crypto'
import { prisma } from './db'
import { ApiError } from './errors'
import { log } from './logger'
import { endActivity, updateActivity } from './activities'
import type { Project } from '@prisma/client'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function demoStepMs(): number {
  const raw = Number(process.env.LIVEHIVE_DEMO_STEP_MS || 10_000)
  if (!Number.isFinite(raw) || raw < 0) return 10_000
  return raw
}

export function demoApiKey(): string | undefined {
  const value = process.env.LIVEHIVE_DEMO_API_KEY?.trim()
  return value || undefined
}

export async function projectFromDemoApiKey(): Promise<Project> {
  const token = demoApiKey()
  if (!token || !isApiKeyFormat(token) || !token.startsWith('lh_live_')) {
    throw new ApiError(
      500,
      'misconfigured',
      'Set LIVEHIVE_DEMO_API_KEY in Vercel to a lh_live_ server API key, then redeploy.',
    )
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(token) },
    include: { project: true },
  })
  if (!apiKey || apiKey.revokedAt) {
    throw new ApiError(401, 'invalid_api_key', 'LIVEHIVE_DEMO_API_KEY is invalid or revoked.')
  }
  if (apiKey.type !== 'SECRET') {
    throw new ApiError(500, 'misconfigured', 'LIVEHIVE_DEMO_API_KEY must be a server key (lh_live_).')
  }
  return apiKey.project
}

export async function runDemoLifecycle(project: Project, activityId: string) {
  const delay = demoStepMs()
  log.info('demo delivery: update scheduled', { activityId, delay })
  await sleep(delay)
  const updated = await updateActivity({
    project,
    externalActivityId: activityId,
    contentState: { status: 'driver_arriving', eta: 4 },
  })
  log.info('demo delivery: update', { activityId, status: updated.status })
  await sleep(delay)
  const ended = await endActivity({
    project,
    externalActivityId: activityId,
    contentState: { status: 'delivered', eta: 0 },
  })
  log.info('demo delivery: end', { activityId, status: ended.status })
}
