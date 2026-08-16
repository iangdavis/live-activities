import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { createUserWithAccount } from '@/lib/auth'
import { createProject } from '@/lib/projects'
import { createApiKey, revokeApiKey } from '@/lib/api-keys'
import { setApnsSender, type ApnsResult, type ApnsSender } from '@/lib/apns'
import { setAnalyticsStore } from '@/lib/analytics'
import { encryptSecret } from '@/lib/crypto'
import { POST as postRegister } from '@/app/api/v1/activities/register/route'
import { POST as postLegacyRegister } from '@/app/api/v1/activities/route'
import { GET as getActivity } from '@/app/api/v1/activities/[activityId]/route'
import { POST as postUpdate } from '@/app/api/v1/activities/[activityId]/update/route'
import { POST as postEnd } from '@/app/api/v1/activities/[activityId]/end/route'

const hasDb = Boolean(process.env.RUN_DB_TESTS === '1' || process.env.CI)

class MockApns implements ApnsSender {
  calls: unknown[] = []
  async sendLiveActivity(_creds: never, push: never): Promise<ApnsResult> {
    this.calls.push(push)
    return { ok: true, status: 200 }
  }
}

const mock = new MockApns()

async function seed() {
  const suffix = Math.random().toString(36).slice(2, 10)
  const userA = await createUserWithAccount({
    email: `pub-a-${suffix}@example.com`,
    password: 'password12',
    name: 'Ada',
  })
  const userB = await createUserWithAccount({
    email: `pub-b-${suffix}@example.com`,
    password: 'password12',
    name: 'Bob',
  })
  const projectA = await createProject({
    accountId: userA.accountId,
    userId: userA.id,
    name: 'App A',
  })
  const projectB = await createProject({
    accountId: userB.accountId,
    userId: userB.id,
    name: 'App B',
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
  const secretA = await createApiKey({
    accountId: userA.accountId,
    userId: userA.id,
    projectId: projectA.id,
    name: 'Server A',
    type: 'SECRET',
  })
  const publicA = await createApiKey({
    accountId: userA.accountId,
    userId: userA.id,
    projectId: projectA.id,
    name: 'iOS A',
    type: 'PUBLIC',
  })
  const publicB = await createApiKey({
    accountId: userB.accountId,
    userId: userB.id,
    projectId: projectB.id,
    name: 'iOS B',
    type: 'PUBLIC',
  })
  const secretB = await createApiKey({
    accountId: userB.accountId,
    userId: userB.id,
    projectId: projectB.id,
    name: 'Server B',
    type: 'SECRET',
  })
  return {
    userA,
    projectA,
    projectB,
    secretA,
    publicA,
    publicB,
    secretB,
  }
}

function jsonRequest(url: string, apiKey: string, body?: unknown) {
  return new NextRequest(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function params(activityId: string) {
  return { params: Promise.resolve({ activityId }) }
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

describe.skipIf(!hasDb)('public key security boundaries', () => {
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
  })

  it('lets a public key register without returning the push token', async () => {
    const { publicA, projectA } = await seed()
    const response = await postRegister(
      jsonRequest('http://localhost/api/v1/activities/register', publicA.plaintext, {
        activity_id: 'order-1',
        push_token: 'a'.repeat(64),
        type: 'delivery',
      }),
    )
    expect(response.status).toBe(201)
    const body = await readJson(response)
    expect(body.id).toBe('order-1')
    expect(body.status).toBe('active')
    expect(JSON.stringify(body)).not.toMatch(/push_token|pushToken|aaaa/)
    expect(JSON.stringify(body)).not.toMatch(/apns|PRIVATE KEY|lh_live_|lh_pub_/)
    const stored = await prisma.activity.findFirstOrThrow({
      where: { projectId: projectA.id, externalActivityId: 'order-1' },
    })
    expect(stored.pushToken).toBe('a'.repeat(64))
  })

  it('replaces the push token on re-registration', async () => {
    const { publicA, projectA } = await seed()
    const payload = (token: string) =>
      jsonRequest('http://localhost/api/v1/activities/register', publicA.plaintext, {
        activity_id: 'order-rotate',
        push_token: token,
      })
    await postRegister(payload('b'.repeat(64)))
    const second = await postRegister(payload('c'.repeat(64)))
    expect(second.status).toBe(201)
    const rows = await prisma.activity.findMany({
      where: { projectId: projectA.id, externalActivityId: 'order-rotate' },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.pushToken).toBe('c'.repeat(64))
  })

  it('rejects public keys on update, end, GET, and legacy create', async () => {
    const { publicA, secretA } = await seed()
    await postRegister(
      jsonRequest('http://localhost/api/v1/activities/register', publicA.plaintext, {
        activity_id: 'locked',
        push_token: 'd'.repeat(64),
      }),
    )

    const update = await postUpdate(
      jsonRequest('http://localhost/api/v1/activities/locked/update', publicA.plaintext, {
        content_state: { status: 'stolen' },
      }),
      params('locked'),
    )
    const end = await postEnd(
      jsonRequest('http://localhost/api/v1/activities/locked/end', publicA.plaintext, {
        content_state: { status: 'done' },
      }),
      params('locked'),
    )
    const get = await getActivity(
      jsonRequest('http://localhost/api/v1/activities/locked', publicA.plaintext),
      params('locked'),
    )
    const legacy = await postLegacyRegister(
      jsonRequest('http://localhost/api/v1/activities', publicA.plaintext, {
        activity_id: 'legacy',
        push_token: 'e'.repeat(64),
      }),
    )

    for (const response of [update, end, get, legacy]) {
      expect(response.status).toBe(403)
      const body = await readJson(response)
      expect((body.error as { code: string }).code).toBe('forbidden')
    }

    const secretGet = await getActivity(
      jsonRequest('http://localhost/api/v1/activities/locked', secretA.plaintext),
      params('locked'),
    )
    expect(secretGet.status).toBe(200)
    const secretBody = await readJson(secretGet)
    expect(JSON.stringify(secretBody)).not.toContain('d'.repeat(64))
    expect(secretBody).not.toHaveProperty('push_token')
    expect(secretBody).not.toHaveProperty('pushToken')
  })

  it('lets a secret key register, update, and end', async () => {
    const { secretA } = await seed()
    const created = await postLegacyRegister(
      jsonRequest('http://localhost/api/v1/activities', secretA.plaintext, {
        activity_id: 'compat-1',
        push_token: 'f'.repeat(64),
      }),
    )
    expect(created.status).toBe(201)

    const viaRegister = await postRegister(
      jsonRequest('http://localhost/api/v1/activities/register', secretA.plaintext, {
        activity_id: 'compat-1',
        push_token: '1'.repeat(64),
      }),
    )
    expect(viaRegister.status).toBe(201)

    const updated = await postUpdate(
      jsonRequest('http://localhost/api/v1/activities/compat-1/update', secretA.plaintext, {
        content_state: { status: 'driver_arriving', eta: 4 },
      }),
      params('compat-1'),
    )
    expect(updated.status).toBe(200)
    const ended = await postEnd(
      jsonRequest('http://localhost/api/v1/activities/compat-1/end', secretA.plaintext, {
        content_state: { status: 'delivered' },
      }),
      params('compat-1'),
    )
    expect(ended.status).toBe(200)
  })

  it('cannot register into another project or mutate another project activity', async () => {
    const { publicA, publicB, secretB, projectA, projectB } = await seed()
    await postRegister(
      jsonRequest('http://localhost/api/v1/activities/register', publicA.plaintext, {
        activity_id: 'shared-name',
        push_token: 'a'.repeat(64),
      }),
    )
    await postRegister(
      jsonRequest('http://localhost/api/v1/activities/register', publicB.plaintext, {
        activity_id: 'shared-name',
        push_token: 'b'.repeat(64),
      }),
    )

    const rowA = await prisma.activity.findFirstOrThrow({
      where: { projectId: projectA.id, externalActivityId: 'shared-name' },
    })
    const rowB = await prisma.activity.findFirstOrThrow({
      where: { projectId: projectB.id, externalActivityId: 'shared-name' },
    })
    expect(rowA.id).not.toBe(rowB.id)
    expect(rowA.pushToken).toBe('a'.repeat(64))
    expect(rowB.pushToken).toBe('b'.repeat(64))

    const stolen = await postUpdate(
      jsonRequest('http://localhost/api/v1/activities/shared-name/update', secretB.plaintext, {
        content_state: { status: 'stolen' },
      }),
      params('shared-name'),
    )
    expect(stolen.status).toBe(200)
    expect(mock.calls).toHaveLength(1)
    const afterA = await prisma.activity.findFirstOrThrow({
      where: { projectId: projectA.id, externalActivityId: 'shared-name' },
    })
    expect(afterA.pushToken).toBe('a'.repeat(64))
    expect(afterA.lastDeliveryStatus).toBeNull()
  })

  it('rejects a revoked public key', async () => {
    const { userA, projectA, publicA } = await seed()
    await revokeApiKey({
      accountId: userA.accountId,
      projectId: projectA.id,
      apiKeyId: publicA.id,
    })
    const response = await postRegister(
      jsonRequest('http://localhost/api/v1/activities/register', publicA.plaintext, {
        activity_id: 'revoked',
        push_token: 'g'.repeat(64),
      }),
    )
    expect(response.status).toBe(401)
    const body = await readJson(response)
    expect((body.error as { code: string }).code).toBe('invalid_api_key')
  })

  it('stores public keys as recoverable and secret keys as hashed-only', async () => {
    const { publicA, secretA } = await seed()
    const pub = await prisma.apiKey.findUniqueOrThrow({ where: { id: publicA.id } })
    const secret = await prisma.apiKey.findUniqueOrThrow({ where: { id: secretA.id } })
    expect(pub.type).toBe('PUBLIC')
    expect(pub.revealedKey).toBe(publicA.plaintext)
    expect(secret.type).toBe('SECRET')
    expect(secret.revealedKey).toBeNull()
    expect(secret.keyHash).not.toContain(secretA.plaintext)
  })
})
