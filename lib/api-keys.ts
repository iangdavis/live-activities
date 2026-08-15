import { prisma } from './db'
import { generateApiKey } from './crypto'
import { ApiError } from './errors'
import { EVENTS, track } from './analytics'
import { getOwnedProject } from './projects'

export async function listApiKeys(accountId: string, projectId: string) {
  await getOwnedProject(accountId, projectId)
  return prisma.apiKey.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  })
}

export async function createApiKey(input: {
  accountId: string
  userId: string
  projectId: string
  name: string
}) {
  const project = await getOwnedProject(input.accountId, input.projectId)
  const name = input.name.trim() || 'Default'
  const generated = generateApiKey()

  const record = await prisma.apiKey.create({
    data: {
      projectId: project.id,
      name,
      keyHash: generated.hash,
      keyPrefix: generated.prefix,
    },
  })

  await track({
    name: EVENTS.API_KEY_CREATED,
    userId: input.userId,
    accountId: input.accountId,
    projectId: project.id,
  })

  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.keyPrefix,
    createdAt: record.createdAt,
    plaintext: generated.plaintext,
  }
}

export async function revokeApiKey(input: {
  accountId: string
  projectId: string
  apiKeyId: string
}) {
  await getOwnedProject(input.accountId, input.projectId)
  const key = await prisma.apiKey.findFirst({
    where: { id: input.apiKeyId, projectId: input.projectId },
  })
  if (!key) {
    throw new ApiError(404, 'api_key_not_found', 'API key not found.')
  }
  if (key.revokedAt) return key
  return prisma.apiKey.update({
    where: { id: key.id },
    data: { revokedAt: new Date() },
  })
}
