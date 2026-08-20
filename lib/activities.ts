import type { Activity, Delivery, Prisma, Project } from '@prisma/client'
import { prisma } from './db'
import { generatePublicId, decryptSecret } from './crypto'
import { ApiError } from './errors'
import { EVENTS, track, trackOnce } from './analytics'
import { currentMonthKey, FREE_TIER } from './plan'
import { getApnsSender, normalizePushToken, type ApnsCredentials } from './apns'
import { log } from './logger'

export type DeliveryResponse = {
  id: string
  activity_id: string
  status: 'queued' | 'sent' | 'failed'
}

function toDeliveryResponse(delivery: Delivery, externalActivityId: string): DeliveryResponse {
  return {
    id: delivery.publicId,
    activity_id: externalActivityId,
    status: delivery.status,
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function redactSecrets(value: string) {
  return value
    .replace(/(key_id|team_id|bundle_id|token|secret|password)=[^\s,}]+/gi, '$1=[redacted]')
    .replace(/(Authorization:|authorization:).*/g, '$1 [redacted]')
}

function serializeError(error: unknown) {
  if (!(error instanceof Error)) {
    return { name: 'UnknownError', message: String(error) }
  }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack ? redactSecrets(error.stack) : undefined,
  }
}

function conciseDeliveryError(input: {
  project: Project
  event: 'update' | 'end'
  status: 'sent' | 'failed'
  apnsStatus?: number | null
  apnsReason?: string | null
  error?: string | null
}) {
  const bits = [
    `event=${input.event}`,
    `status=${input.status}`,
    `apns=${input.apnsStatus ?? 'n/a'}`,
    input.apnsReason ? `reason=${input.apnsReason}` : null,
    input.error ? `error=${input.error}` : null,
    `env=${input.project.apnsEnvironment}`,
  ].filter(Boolean)
  return bits.join(' | ')
}

export function activityRegistrationWaitMs() {
  const raw = Number(process.env.LIVEHIVE_ACTIVITY_REGISTRATION_WAIT_MS ?? 10_000)
  if (!Number.isFinite(raw) || raw < 0) return 10_000
  return Math.min(raw, 30_000)
}

export async function registerActivity(input: {
  project: Project
  externalActivityId: string
  pushToken: string
  type?: string
  expiresAt?: Date
  createLimit?: number
}) {
  const pushToken = normalizePushToken(input.pushToken)
  const existing = await prisma.activity.findUnique({
    where: {
      projectId_externalActivityId: {
        projectId: input.project.id,
        externalActivityId: input.externalActivityId,
      },
    },
  })

  if (!existing && input.createLimit != null) {
    const activeCount = await prisma.activity.count({
      where: { projectId: input.project.id, status: 'active' },
    })
    if (activeCount >= input.createLimit) {
      throw new ApiError(
        403,
        'plan_limit',
        `Active activity limit (${input.createLimit}) reached.`,
      )
    }
  }

  const data = {
    pushToken,
    type: input.type ?? existing?.type ?? null,
    expiresAt: input.expiresAt ?? existing?.expiresAt ?? null,
    status: 'active' as const,
    endedAt: null,
  }

  const activity = existing
    ? await prisma.activity.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.activity.create({
        data: {
          projectId: input.project.id,
          externalActivityId: input.externalActivityId,
          ...data,
        },
      })

  if (!existing) {
    await track({
      name: EVENTS.ACTIVITY_REGISTERED,
      accountId: input.project.accountId,
      projectId: input.project.id,
      properties: { activity_id: input.externalActivityId },
    })
  }

  return {
    id: activity.externalActivityId,
    type: activity.type,
    status: activity.status,
    created_at: activity.createdAt.toISOString(),
    updated_at: activity.updatedAt.toISOString(),
    expires_at: activity.expiresAt?.toISOString() ?? null,
  }
}

export async function findProjectActivity(projectId: string, externalActivityId: string) {
  const activity = await prisma.activity.findUnique({
    where: {
      projectId_externalActivityId: {
        projectId,
        externalActivityId,
      },
    },
  })
  if (!activity) {
    throw new ApiError(404, 'activity_not_found', 'Activity not found for this project.')
  }
  return activity
}

export async function waitForProjectActivity(
  projectId: string,
  externalActivityId: string,
  waitMs = 0,
) {
  const startedAt = Date.now()
  let delayMs = 100

  while (true) {
    const activity = await prisma.activity.findUnique({
      where: {
        projectId_externalActivityId: {
          projectId,
          externalActivityId,
        },
      },
    })
    if (activity) return activity

    const elapsedMs = Date.now() - startedAt
    const remainingMs = waitMs - elapsedMs
    if (remainingMs <= 0) {
      throw new ApiError(404, 'activity_not_found', 'Activity not found for this project.')
    }

    await sleep(Math.min(delayMs, remainingMs))
    delayMs = Math.min(delayMs * 2, 1_000)
  }
}

async function assertUpdateQuota(projectId: string) {
  const month = currentMonthKey()
  const usage = await prisma.usageMonth.upsert({
    where: { projectId_month: { projectId, month } },
    create: { projectId, month, updates: 0 },
    update: {},
  })
  if (usage.updates >= FREE_TIER.maxUpdatesPerMonth) {
    throw new ApiError(
      403,
      'plan_limit',
      `Monthly update limit (${FREE_TIER.maxUpdatesPerMonth}) reached.`,
    )
  }
}

async function incrementUsage(projectId: string) {
  const month = currentMonthKey()
  await prisma.usageMonth.upsert({
    where: { projectId_month: { projectId, month } },
    create: { projectId, month, updates: 1 },
    update: { updates: { increment: 1 } },
  })
}

function projectCredentials(project: Project): ApnsCredentials {
  const appleTeamId = project.appleTeamId?.trim()
  const appleKeyId = project.appleKeyId?.trim()
  const bundleId = project.bundleId?.trim()
  const apnsKeyEncrypted = project.apnsKeyEncrypted
  const missing = {
    appleTeamId: !appleTeamId,
    appleKeyId: !appleKeyId,
    bundleId: !bundleId,
    apnsKeyEncrypted: !apnsKeyEncrypted,
  }
  if (missing.appleTeamId || missing.appleKeyId || missing.bundleId || missing.apnsKeyEncrypted) {
    log.error('apns credentials missing', {
      projectId: project.id,
      projectPublicId: project.publicId,
      missing,
      apnsEnvironment: project.apnsEnvironment,
    })
    throw new ApiError(
      400,
      'apns_not_configured',
      'This project has no APNs credentials. Add your Apple Team ID, Key ID, private key, and Bundle ID on the project page.',
    )
  }
  return {
    teamId: appleTeamId!,
    keyId: appleKeyId!,
    bundleId: bundleId!,
    environment: project.apnsEnvironment,
    privateKeyPem: decryptSecret(apnsKeyEncrypted!),
  }
}

export async function enqueueAndDeliver(input: {
  project: Project
  activity: Activity
  type: 'update' | 'end'
  contentState?: Record<string, unknown>
  alert?: { title?: string; body?: string; sound?: string }
  staleDate?: number
  relevanceScore?: number
  dismissalDate?: number
  userId?: string
}): Promise<DeliveryResponse> {
  if (input.type === 'update') {
    await assertUpdateQuota(input.project.id)
  }

  const payload = {
    contentState: input.contentState,
    alert: input.alert,
    staleDate: input.staleDate,
    relevanceScore: input.relevanceScore,
    dismissalDate: input.dismissalDate,
  }

  const delivery = await prisma.delivery.create({
    data: {
      publicId: generatePublicId(input.type === 'end' ? 'end' : 'upd'),
      activityId: input.activity.id,
      projectId: input.project.id,
      type: input.type,
      status: 'queued',
      contentState: (input.contentState ?? undefined) as Prisma.InputJsonValue | undefined,
      payload: payload as Prisma.InputJsonValue,
    },
  })

  if (input.type === 'update') {
    await incrementUsage(input.project.id)
    await trackOnce({
      name: EVENTS.FIRST_UPDATE_ATTEMPTED,
      userId: input.userId,
      accountId: input.project.accountId,
      projectId: input.project.id,
    })
  }

  const processed = await processDelivery(delivery.id)
  return toDeliveryResponse(processed, input.activity.externalActivityId)
}

export async function processDelivery(deliveryId: string): Promise<Delivery> {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: { activity: true, project: true },
  })
  if (!delivery) {
    throw new ApiError(404, 'delivery_not_found', 'Delivery not found.')
  }
  if (delivery.status !== 'queued') return delivery

  try {
    const credentials = projectCredentials(delivery.project)
    const payload = (delivery.payload as {
      contentState?: Record<string, unknown>
      alert?: { title?: string; body?: string; sound?: string }
      staleDate?: number
      relevanceScore?: number
      dismissalDate?: number
    } | null) ?? {}
    const result = await getApnsSender().sendLiveActivity(credentials, {
      deviceToken: delivery.activity.pushToken,
      event: delivery.type,
      contentState: payload.contentState ?? (delivery.contentState as Record<string, unknown> | null) ?? undefined,
      alert: payload.alert,
      staleDate: payload.staleDate,
      relevanceScore: payload.relevanceScore,
      dismissalDate: payload.dismissalDate,
    })

    const status = result.ok ? 'sent' : 'failed'
    const updated = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status,
        apnsStatus: result.status,
        apnsReason: result.ok ? null : result.reason,
        error: result.ok
          ? null
          : conciseDeliveryError({
              project: delivery.project,
              event: delivery.type,
              status,
              apnsStatus: result.status,
              apnsReason: result.reason,
              error: result.error ?? null,
            }),
        completedAt: new Date(),
      },
    })

    await prisma.activity.update({
      where: { id: delivery.activityId },
      data: {
        lastDeliveryStatus: status,
        lastDeliveryAt: new Date(),
        ...(delivery.type === 'end' && result.ok
          ? { status: 'ended', endedAt: new Date() }
          : {}),
        ...(delivery.type === 'end' && !result.ok ? { status: 'failed' } : {}),
      },
    })

    if (!result.ok) {
      log.warn('apns delivery failed', {
        deliveryId: delivery.publicId,
        apnsStatus: result.status,
        reason: result.reason,
      })
    }

    return updated
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Delivery failed before reaching APNs.'
    const code = error instanceof ApiError ? error.code : 'delivery_error'

    log.error('delivery processing error', {
      deliveryId: delivery.publicId,
      code,
      message,
      activityId: delivery.activity.externalActivityId,
      projectId: delivery.project.publicId,
      apnsEnvironment: delivery.project.apnsEnvironment,
      error: serializeError(error),
    })

    if (error instanceof ApiError) {
      log.error('delivery api error details', {
        deliveryId: delivery.publicId,
        errorCode: error.code,
        errorMessage: error.message,
        errorData: (error as ApiError & { data?: unknown }).data,
      })
    }

    const updated = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status: 'failed',
        error: conciseDeliveryError({
          project: delivery.project,
          event: delivery.type,
          status: 'failed',
          error: message,
        }),
        completedAt: new Date(),
      },
    })
    await prisma.activity.update({
      where: { id: delivery.activityId },
      data: {
        lastDeliveryStatus: 'failed',
        lastDeliveryAt: new Date(),
      },
    })
    return updated
  }
}

export async function processQueuedDeliveries(limit = 25): Promise<number> {
  const queued = await prisma.delivery.findMany({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true },
  })
  for (const item of queued) {
    await processDelivery(item.id)
  }
  return queued.length
}

export async function updateActivity(input: {
  project: Project
  externalActivityId: string
  contentState: Record<string, unknown>
  alert?: { title?: string; body?: string; sound?: string }
  staleDate?: number
  relevanceScore?: number
  userId?: string
  waitForRegistrationMs?: number
}) {
  const activity = await waitForProjectActivity(
    input.project.id,
    input.externalActivityId,
    input.waitForRegistrationMs ?? 0,
  )
  if (activity.status === 'ended') {
    throw new ApiError(409, 'activity_ended', 'This activity has already ended.')
  }
  return enqueueAndDeliver({
    project: input.project,
    activity,
    type: 'update',
    contentState: input.contentState,
    alert: input.alert,
    staleDate: input.staleDate,
    relevanceScore: input.relevanceScore,
    userId: input.userId,
  })
}

export async function endActivity(input: {
  project: Project
  externalActivityId: string
  contentState?: Record<string, unknown>
  dismissalDate?: number
  waitForRegistrationMs?: number
}) {
  const activity = await waitForProjectActivity(
    input.project.id,
    input.externalActivityId,
    input.waitForRegistrationMs ?? 0,
  )
  if (activity.status === 'ended') {
    throw new ApiError(409, 'activity_ended', 'This activity has already ended.')
  }
  return enqueueAndDeliver({
    project: input.project,
    activity,
    type: 'end',
    contentState: input.contentState,
    dismissalDate: input.dismissalDate,
  })
}

export async function getActivityPublic(projectId: string, externalActivityId: string) {
  const activity = await findProjectActivity(projectId, externalActivityId)
  return {
    id: activity.externalActivityId,
    type: activity.type,
    status: activity.status,
    created_at: activity.createdAt.toISOString(),
    updated_at: activity.updatedAt.toISOString(),
    ended_at: activity.endedAt?.toISOString() ?? null,
    expires_at: activity.expiresAt?.toISOString() ?? null,
  }
}
