import { prisma } from './db'
import { generateApiKey, type ApiKeyKind } from './crypto'
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
      type: true,
      keyPrefix: true,
      revealedKey: true,
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
  type?: ApiKeyKind
}) {
  const project = await getOwnedProject(input.accountId, input.projectId)
  const type: ApiKeyKind = input.type === 'PUBLIC' ? 'PUBLIC' : 'SECRET'
  const name =
    input.name.trim() || (type === 'PUBLIC' ? 'iOS Public Key' : 'Server API Key')
  const generated = generateApiKey(type)

  const record = await prisma.apiKey.create({
    data: {
      projectId: project.id,
      name,
      type,
      keyHash: generated.hash,
      keyPrefix: generated.prefix,
      revealedKey: type === 'PUBLIC' ? generated.plaintext : null,
    },
  })

  await track({
    name: EVENTS.API_KEY_CREATED,
    userId: input.userId,
    accountId: input.accountId,
    projectId: project.id,
    properties: { type },
  })

  return {
    id: record.id,
    name: record.name,
    type: record.type,
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
    data: { revokedAt: new Date(), revealedKey: null },
  })
}
