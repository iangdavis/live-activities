import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/db'
import { createUserWithAccount } from '@/lib/auth'
import { createProject } from '@/lib/projects'
import { registerActivity, updateActivity } from '@/lib/activities'
import { setApnsSender, type ApnsResult, type ApnsSender } from '@/lib/apns'
import { encryptSecret } from '@/lib/crypto'
import { setAnalyticsStore } from '@/lib/analytics'
import { ApiError } from '@/lib/errors'
import {
  DELIVERY_STATES,
  endDashboardActivity,
  runDeliveryDriveTail,
  sendDashboardTestUpdate,
} from '@/lib/demo'
import type { Project } from '@prisma/client'

const hasDb = Boolean(process.env.RUN_DB_TESTS === '1' || process.env.CI)

class MockApns implements ApnsSender {
  calls: unknown[] = []
  next: ApnsResult = { ok: true, status: 200 }
  async sendLiveActivity(_creds: never, push: never): Promise<ApnsResult> {
    this.calls.push(push)
    return this.next
  }
}

const mock = new MockApns()

async function seed() {
  const suffix = Math.random().toString(36).slice(2, 10)
  const user = await createUserWithAccount({
    email: `demo-${suffix}@example.com`,
    password: 'password12',
    name: 'Ada',
  })
  const other = await createUserWithAccount({
    email: `demo-b-${suffix}@example.com`,
    password: 'password12',
    name: 'Bob',
  })
  const project = await createProject({
    accountId: user.accountId,
    userId: user.id,
    name: 'Demo',
  })
  await prisma.project.update({
    where: { id: project.id },
    data: {
      appleTeamId: 'TEAM123456',
      appleKeyId: 'KEY1234567',
      bundleId: 'com.example.app',
      apnsEnvironment: 'sandbox',
      apnsKeyEncrypted: encryptSecret(
        '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----',
      ),
    },
  })
  const loaded = await prisma.project.findUniqueOrThrow({ where: { id: project.id } })
  return { user, other, project: loaded as Project }
}

describe.skipIf(!hasDb)('dashboard demo updates', () => {
  beforeAll(async () => {
    setApnsSender(mock as unknown as ApnsSender)
    setAnalyticsStore({
      async track() {},
      async hasEvent() {
        return false
      },
    })
    await prisma.$connect()
  })

  afterEach(() => {
    mock.calls = []
    mock.next = { ok: true, status: 200 }
  })

  it('sends a test update for an owned activity without an API key', async () => {
    const { user, project } = await seed()
    await registerActivity({
      project,
      externalActivityId: 'demo-act',
      pushToken: 'a'.repeat(64),
      type: 'delivery',
    })
    const row = await prisma.activity.findFirstOrThrow({
      where: { projectId: project.id, externalActivityId: 'demo-act' },
    })
    const result = await sendDashboardTestUpdate({
      accountId: user.accountId,
      userId: user.id,
      activityId: row.id,
    })
    expect(result.status).toBe('sent')
    expect(result.activity_id).toBe('demo-act')
    expect(mock.calls).toHaveLength(1)
    const delivery = await prisma.delivery.findFirstOrThrow({
      where: { publicId: result.id },
    })
    expect(delivery.contentState).toMatchObject(DELIVERY_STATES.arriving)
  })

  it('rejects another account', async () => {
    const { other, project } = await seed()
    await registerActivity({
      project,
      externalActivityId: 'not-yours',
      pushToken: 'b'.repeat(64),
    })
    const row = await prisma.activity.findFirstOrThrow({
      where: { projectId: project.id, externalActivityId: 'not-yours' },
    })
    await expect(
      sendDashboardTestUpdate({
        accountId: other.accountId,
        userId: other.id,
        activityId: row.id,
      }),
    ).rejects.toMatchObject({ code: 'activity_not_found', status: 404 })
  })

  it('drives nearby then end when stepMs is 0', async () => {
    const { project } = await seed()
    await registerActivity({
      project,
      externalActivityId: 'drive-1',
      pushToken: 'c'.repeat(64),
    })
    await updateActivity({
      project,
      externalActivityId: 'drive-1',
      contentState: DELIVERY_STATES.arriving,
    })
    await runDeliveryDriveTail({
      project,
      externalActivityId: 'drive-1',
      stepMs: 0,
    })
    const activity = await prisma.activity.findFirstOrThrow({
      where: { projectId: project.id, externalActivityId: 'drive-1' },
    })
    expect(activity.status).toBe('ended')
    const types = (
      await prisma.delivery.findMany({
        where: { activityId: activity.id },
        orderBy: { createdAt: 'asc' },
      })
    ).map((d) => d.type)
    expect(types).toEqual(['update', 'update', 'end'])
  })

  it('ends from the dashboard', async () => {
    const { user, project } = await seed()
    await registerActivity({
      project,
      externalActivityId: 'end-1',
      pushToken: 'd'.repeat(64),
    })
    const row = await prisma.activity.findFirstOrThrow({
      where: { projectId: project.id, externalActivityId: 'end-1' },
    })
    const result = await endDashboardActivity({
      accountId: user.accountId,
      userId: user.id,
      activityId: row.id,
    })
    expect(result.status).toBe('sent')
    const activity = await prisma.activity.findFirstOrThrow({ where: { id: row.id } })
    expect(activity.status).toBe('ended')
  })

  it('does not expose a secret key on the demo helpers', () => {
    expect(ApiError).toBeTruthy()
    const source = sendDashboardTestUpdate.toString()
    expect(source).not.toContain('lh_live_')
  })
})
