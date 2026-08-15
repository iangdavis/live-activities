import type { Prisma } from '@prisma/client'

export const EVENTS = {
  LANDING_PAGE_VISIT: 'LANDING_PAGE_VISIT',
  SIGNUP: 'SIGNUP',
  PROJECT_CREATED: 'PROJECT_CREATED',
  API_KEY_CREATED: 'API_KEY_CREATED',
  ACTIVITY_REGISTERED: 'ACTIVITY_REGISTERED',
  FIRST_UPDATE_ATTEMPTED: 'FIRST_UPDATE_ATTEMPTED',
  FIRST_SUCCESSFUL_LIVE_ACTIVITY_UPDATE: 'FIRST_SUCCESSFUL_LIVE_ACTIVITY_UPDATE',
  ACTIVITY_ENDED: 'ACTIVITY_ENDED',
  DOCUMENTATION_VIEWED: 'DOCUMENTATION_VIEWED',
} as const

export type AnalyticsEventName = (typeof EVENTS)[keyof typeof EVENTS]

export type TrackInput = {
  name: AnalyticsEventName
  userId?: string | null
  accountId?: string | null
  projectId?: string | null
  properties?: Record<string, unknown>
}

type AnalyticsStore = {
  track(input: TrackInput): Promise<void>
  hasEvent(input: {
    name: AnalyticsEventName
    userId?: string
    projectId?: string
  }): Promise<boolean>
}

let store: AnalyticsStore | null = null

export function setAnalyticsStore(next: AnalyticsStore | null) {
  store = next
}

async function defaultStore(): Promise<AnalyticsStore> {
  const { prisma } = await import('./db')
  return {
    async track(input) {
      await prisma.analyticsEvent.create({
        data: {
          name: input.name,
          userId: input.userId ?? null,
          accountId: input.accountId ?? null,
          projectId: input.projectId ?? null,
          properties: input.properties
            ? (input.properties as Prisma.InputJsonValue)
            : undefined,
        },
      })
    },
    async hasEvent({ name, userId, projectId }) {
      const found = await prisma.analyticsEvent.findFirst({
        where: {
          name,
          ...(userId ? { userId } : {}),
          ...(projectId ? { projectId } : {}),
        },
        select: { id: true },
      })
      return Boolean(found)
    },
  }
}

export async function track(input: TrackInput): Promise<void> {
  try {
    const impl = store ?? (await defaultStore())
    await impl.track(input)
  } catch {
    // Analytics must never break the product path.
  }
}

export async function trackOnce(
  input: TrackInput & { userId?: string; projectId?: string },
): Promise<void> {
  try {
    const impl = store ?? (await defaultStore())
    const exists = await impl.hasEvent({
      name: input.name,
      userId: input.userId,
      projectId: input.projectId,
    })
    if (exists) return
    await impl.track(input)
  } catch {
    // ignore
  }
}

export async function countFirstSuccessfulUpdates(): Promise<number> {
  const { prisma } = await import('./db')
  return prisma.analyticsEvent.count({
    where: { name: EVENTS.FIRST_SUCCESSFUL_LIVE_ACTIVITY_UPDATE },
  })
}
