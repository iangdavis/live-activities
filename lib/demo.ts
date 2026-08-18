import type { Activity, Project } from '@prisma/client'
import { prisma } from './db'
import { ApiError } from './errors'
import { endActivity, updateActivity } from './activities'

/** Matches DeliveryAttributes.ContentState in the iOS SDK. */
export const DELIVERY_STATES = {
  preparing: { status: 'preparing', eta: 12 },
  arriving: { status: 'driver_arriving', eta: 4 },
  nearby: { status: 'nearby', eta: 1 },
  delivered: { status: 'delivered', eta: 0 },
} as const

export const DEMO_STEP_MS = 4000

export type OwnedActivity = {
  activity: Activity
  project: Project
}

export async function loadOwnedActivity(
  accountId: string,
  activityId: string,
): Promise<OwnedActivity> {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, project: { accountId } },
    include: { project: true },
  })
  if (!activity) {
    throw new ApiError(404, 'activity_not_found', 'Activity not found.')
  }
  return { activity, project: activity.project }
}

export async function sendDashboardTestUpdate(input: {
  accountId: string
  userId: string
  activityId: string
  contentState?: Record<string, unknown>
}) {
  const { activity, project } = await loadOwnedActivity(
    input.accountId,
    input.activityId,
  )
  return updateActivity({
    project,
    externalActivityId: activity.externalActivityId,
    contentState: input.contentState ?? DELIVERY_STATES.arriving,
    alert: { title: 'Live Hive', body: 'Test update' },
    userId: input.userId,
  })
}

export async function endDashboardActivity(input: {
  accountId: string
  userId: string
  activityId: string
}) {
  const { activity, project } = await loadOwnedActivity(
    input.accountId,
    input.activityId,
  )
  return endActivity({
    project,
    externalActivityId: activity.externalActivityId,
    contentState: DELIVERY_STATES.delivered,
  })
}

export async function runDeliveryDriveTail(input: {
  project: Project
  externalActivityId: string
  stepMs?: number
}) {
  const step = input.stepMs ?? DEMO_STEP_MS
  if (step > 0) await sleep(step)
  await updateActivity({
    project: input.project,
    externalActivityId: input.externalActivityId,
    contentState: DELIVERY_STATES.nearby,
  })
  if (step > 0) await sleep(step)
  await endActivity({
    project: input.project,
    externalActivityId: input.externalActivityId,
    contentState: DELIVERY_STATES.delivered,
  })
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}
