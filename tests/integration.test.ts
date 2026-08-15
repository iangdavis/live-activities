import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/db'
import { createUserWithAccount, hashPassword } from '@/lib/auth'
import { createProject } from '@/lib/projects'
import { createApiKey } from '@/lib/api-keys'
import { authenticateApiRequest } from '@/lib/api-auth'
import {
  endActivity,
  registerActivity,
  updateActivity,
} from '@/lib/activities'
import { setApnsSender, type ApnsResult, type ApnsSender } from '@/lib/apns'
import { encryptSecret } from '@/lib/crypto'
import { ApiError } from '@/lib/errors'
import { setAnalyticsStore } from '@/lib/analytics'
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
  const userA = await createUserWithAccount({
    email: `a-${suffix}@example.com`,
    password: 'password12',
    name: 'Ada',
  })
  const userB = await createUserWithAccount({
    email: `b-${suffix}@example.com`,
    password: 'password12',
    name: 'Bob',
  })
  const projectA = await createProject({
    accountId: userA.accountId,
    userId: userA.id,
    name: 'My Delivery App',
  })
  const projectB = await createProject({
    accountId: userB.accountId,
    userId: userB.id,
    name: 'Other App',
  })
  await prisma.project.update({
    where: { id: projectA.id },
    data: {
      appleTeamId: 'TEAM123456',
      appleKeyId: 'KEY1234567',
      bundleId: 'com.example.app',
      apnsEnvironment: 'sandbox',
      apnsKeyEncrypted: encryptSecret('-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----'),
    },
  })
  await prisma.project.update({
    where: { id: projectB.id },
    data: {
      appleTeamId: 'TEAM999999',
      appleKeyId: 'KEY9999999',
      bundleId: 'com.other.app',
      apnsEnvironment: 'sandbox',
      apnsKeyEncrypted: encryptSecret('-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----'),
    },
  })
  const keyA = await createApiKey({
    accountId: userA.accountId,
    userId: userA.id,
    projectId: projectA.id,
    name: 'A',
  })
  const keyB = await createApiKey({
    accountId: userB.accountId,
    userId: userB.id,
    projectId: projectB.id,
    name: 'B',
  })
  return {
    userA,
    userB,
    projectA: await prisma.project.findUniqueOrThrow({ where: { id: projectA.id } }),
    projectB: await prisma.project.findUniqueOrThrow({ where: { id: projectB.id } }),
    keyA,
    keyB,
  }
}

describe.skipIf(!hasDb)('Live Hive core flow', () => {
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

  it('hashes passwords on signup', async () => {
    const hash = await hashPassword('password12')
    expect(hash).not.toBe('password12')
    expect(hash.startsWith('$2')).toBe(true)
  })

  it('creates a project and authenticates API keys', async () => {
    const { keyA, projectA } = await seed()
    const auth = await authenticateApiRequest(
      new Request('http://localhost/api/v1/activities', {
        headers: { authorization: `Bearer ${keyA.plaintext}` },
      }),
    )
    expect(auth.project.id).toBe(projectA.id)
  })

  it('rejects an invalid API key', async () => {
    await expect(
      authenticateApiRequest(
        new Request('http://localhost/api/v1/activities', {
          headers: { authorization: 'Bearer lh_live_thisisnotarealkeyvalue12' },
        }),
      ),
    ).rejects.toMatchObject({ code: 'invalid_api_key', status: 401 })
  })

  it('registers activities idempotently and updates the token', async () => {
    const { projectA } = await seed()
    const first = await registerActivity({
      project: projectA,
      externalActivityId: 'customer-activity-123',
      pushToken: 'a'.repeat(64),
      type: 'delivery',
    })
    const second = await registerActivity({
      project: projectA,
      externalActivityId: 'customer-activity-123',
      pushToken: 'b'.repeat(64),
    })
    expect(first.id).toBe('customer-activity-123')
    expect(second.id).toBe('customer-activity-123')
    const rows = await prisma.activity.findMany({
      where: { projectId: projectA.id, externalActivityId: 'customer-activity-123' },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.pushToken).toBe('b'.repeat(64))
  })

  it('sends an update through APNs and records delivery', async () => {
    const { projectA } = await seed()
    await registerActivity({
      project: projectA,
      externalActivityId: 'delivery-123',
      pushToken: 'c'.repeat(64),
    })
    const result = await updateActivity({
      project: projectA,
      externalActivityId: 'delivery-123',
      contentState: { status: 'driver_arriving', eta: 4 },
    })
    expect(result.status).toBe('sent')
    expect(result.id.startsWith('upd_')).toBe(true)
    expect(mock.calls).toHaveLength(1)
    const delivery = await prisma.delivery.findFirstOrThrow({
      where: { publicId: result.id },
    })
    expect(delivery.status).toBe('sent')
    expect(delivery.apnsStatus).toBe(200)
  })

  it('records APNs failure instead of faking success', async () => {
    const { projectA } = await seed()
    mock.next = {
      ok: false,
      status: 400,
      reason: 'BadDeviceToken',
      error: 'APNs rejected the push (BadDeviceToken).',
    }
    await registerActivity({
      project: projectA,
      externalActivityId: 'delivery-fail',
      pushToken: 'd'.repeat(64),
    })
    const result = await updateActivity({
      project: projectA,
      externalActivityId: 'delivery-fail',
      contentState: { status: 'x' },
    })
    expect(result.status).toBe('failed')
    const delivery = await prisma.delivery.findFirstOrThrow({
      where: { publicId: result.id },
    })
    expect(delivery.apnsReason).toBe('BadDeviceToken')
  })

  it('ends an activity after a successful APNs end event', async () => {
    const { projectA } = await seed()
    await registerActivity({
      project: projectA,
      externalActivityId: 'delivery-end',
      pushToken: 'e'.repeat(64),
    })
    const result = await endActivity({
      project: projectA,
      externalActivityId: 'delivery-end',
      contentState: { status: 'done' },
    })
    expect(result.status).toBe('sent')
    const activity = await prisma.activity.findFirstOrThrow({
      where: { projectId: projectA.id, externalActivityId: 'delivery-end' },
    })
    expect(activity.status).toBe('ended')
    expect(activity.endedAt).not.toBeNull()
  })

  it('rejects updates for an unknown activity', async () => {
    const { projectA } = await seed()
    await expect(
      updateActivity({
        project: projectA,
        externalActivityId: 'missing',
        contentState: { status: 'x' },
      }),
    ).rejects.toMatchObject({ code: 'activity_not_found', status: 404 })
  })

  it('prevents cross-project activity access', async () => {
    const { projectA, projectB } = await seed()
    await registerActivity({
      project: projectA,
      externalActivityId: 'shared-name',
      pushToken: 'f'.repeat(64),
    })
    await expect(
      updateActivity({
        project: projectB,
        externalActivityId: 'shared-name',
        contentState: { status: 'stolen' },
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('runs register → update → inspect delivery', async () => {
    const { userA, projectA, keyA } = await seed()
    expect(keyA.plaintext.startsWith('lh_live_')).toBe(true)
    expect(userA.accountId).toBeTruthy()
    await registerActivity({
      project: projectA as Project,
      externalActivityId: 'flow-1',
      pushToken: '1'.repeat(64),
    })
    const update = await updateActivity({
      project: projectA,
      externalActivityId: 'flow-1',
      contentState: { status: 'driver_arriving', eta: 4 },
    })
    const delivery = await prisma.delivery.findFirstOrThrow({
      where: { publicId: update.id },
      include: { activity: true },
    })
    expect(delivery.status).toBe('sent')
    expect(delivery.activity.externalActivityId).toBe('flow-1')
    expect(delivery.activity.lastDeliveryStatus).toBe('sent')
  })
})
