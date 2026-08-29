import { prisma } from './db'
import { generatePublicId } from './crypto'
import { ApiError } from './errors'
import { EVENTS, track } from './analytics'
import { FREE_TIER } from './plan'
import { createApnsJwt } from './apns'

export async function listProjects(accountId: string) {
  return prisma.project.findMany({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { activities: true, apiKeys: true } },
    },
  })
}

export async function getOwnedProject(accountId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, accountId },
  })
  if (!project) {
    throw new ApiError(404, 'project_not_found', 'Project not found.')
  }
  return project
}

export async function createProject(input: {
  accountId: string
  userId: string
  name: string
}) {
  const name = input.name.trim()
  if (name.length < 1 || name.length > 80) {
    throw new ApiError(400, 'invalid_request', 'Project name must be 1–80 characters.')
  }

  const existing = await prisma.project.count({ where: { accountId: input.accountId } })
  if (existing >= FREE_TIER.maxProjects) {
    throw new ApiError(
      403,
      'plan_limit',
      `The free plan includes ${FREE_TIER.maxProjects} project. Upgrade to create more.`,
    )
  }

  const project = await prisma.project.create({
    data: {
      accountId: input.accountId,
      name,
      publicId: generatePublicId('proj'),
    },
  })

  await track({
    name: EVENTS.PROJECT_CREATED,
    userId: input.userId,
    accountId: input.accountId,
    projectId: project.id,
    properties: { name: project.name },
  })

  return project
}

export async function updateProjectApns(
  accountId: string,
  projectId: string,
  input: {
    appleTeamId: string
    appleKeyId: string
    bundleId: string
    apnsEnvironment: 'sandbox' | 'production'
    apnsKeyPem?: string
  },
) {
  const project = await getOwnedProject(accountId, projectId)
  const { decryptSecret, encryptSecret } = await import('./crypto')

  const appleTeamId = input.appleTeamId.trim()
  const appleKeyId = input.appleKeyId.trim()
  const bundleId = input.bundleId.trim()
  if (!appleTeamId || !appleKeyId || !bundleId) {
    throw new ApiError(400, 'invalid_request', 'Team ID, Key ID, and Bundle ID are required.')
  }
  if (!/^[A-Z0-9]{10}$/.test(appleTeamId)) {
    throw new ApiError(400, 'invalid_request', 'Team ID must be 10 uppercase letters or numbers.')
  }
  if (!/^[A-Z0-9]{10}$/.test(appleKeyId)) {
    throw new ApiError(400, 'invalid_request', 'Key ID must be 10 uppercase letters or numbers.')
  }
  if (!/^[A-Za-z0-9.-]+$/.test(bundleId) || !bundleId.includes('.')) {
    throw new ApiError(400, 'invalid_request', 'Bundle ID must look like com.example.app.')
  }

  let apnsKeyEncrypted = project.apnsKeyEncrypted
  const nextPrivateKey = input.apnsKeyPem?.trim()
    ? input.apnsKeyPem.trim()
    : project.apnsKeyEncrypted
      ? decryptSecret(project.apnsKeyEncrypted)
      : null
  if (!nextPrivateKey) {
    throw new ApiError(400, 'invalid_request', 'Paste your APNs private key (.p8) to verify these settings.')
  }

  try {
    await createApnsJwt({
      teamId: appleTeamId,
      keyId: appleKeyId,
      privateKeyPem: nextPrivateKey,
      bundleId,
      environment: input.apnsEnvironment,
    })
  } catch (error) {
    throw new ApiError(
      400,
      'invalid_request',
      error instanceof Error
        ? `APNs credential check failed: ${error.message}`
        : 'APNs credential check failed. Check Team ID, Key ID, Bundle ID, and .p8 key.',
    )
  }

  if (input.apnsKeyPem?.trim()) {
    apnsKeyEncrypted = encryptSecret(nextPrivateKey)
  }

  return prisma.project.update({
    where: { id: project.id },
    data: {
      appleTeamId,
      appleKeyId,
      bundleId,
      apnsEnvironment: input.apnsEnvironment,
      apnsKeyEncrypted,
    },
  })
}
