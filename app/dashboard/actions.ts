'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { createProject, updateProjectApns } from '@/lib/projects'
import { createApiKey, revokeApiKey } from '@/lib/api-keys'
import { ApiError } from '@/lib/errors'

async function sessionOrLogin() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function createProjectAction(formData: FormData) {
  const session = await sessionOrLogin()
  const name = String(formData.get('name') || '')
  try {
    const project = await createProject({
      accountId: session.accountId,
      userId: session.id,
      name,
    })
    redirect(`/dashboard/projects/${project.id}`)
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(`/dashboard/projects?error=${encodeURIComponent(error.message)}`)
    }
    throw error
  }
}

export async function updateApnsAction(formData: FormData) {
  const session = await sessionOrLogin()
  const projectId = String(formData.get('projectId') || '')
  try {
    await updateProjectApns(session.accountId, projectId, {
      appleTeamId: String(formData.get('appleTeamId') || ''),
      appleKeyId: String(formData.get('appleKeyId') || ''),
      bundleId: String(formData.get('bundleId') || ''),
      apnsEnvironment:
        String(formData.get('apnsEnvironment') || 'sandbox') === 'production'
          ? 'production'
          : 'sandbox',
      apnsKeyPem: String(formData.get('apnsKeyPem') || '') || undefined,
    })
    redirect(`/dashboard/projects/${projectId}?saved=1`)
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(
        `/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`,
      )
    }
    throw error
  }
}

export async function createApiKeyAction(formData: FormData): Promise<{
  plaintext?: string
  error?: string
}> {
  const session = await getSession()
  if (!session) return { error: 'Not signed in.' }
  const projectId = String(formData.get('projectId') || '')
  const name = String(formData.get('name') || 'Default')
  try {
    const key = await createApiKey({
      accountId: session.accountId,
      userId: session.id,
      projectId,
      name,
    })
    return { plaintext: key.plaintext }
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : 'Could not create API key.',
    }
  }
}

export async function revokeApiKeyAction(formData: FormData) {
  const session = await sessionOrLogin()
  const projectId = String(formData.get('projectId') || '')
  const apiKeyId = String(formData.get('apiKeyId') || '')
  await revokeApiKey({ accountId: session.accountId, projectId, apiKeyId })
  redirect(`/dashboard/api-keys?project=${projectId}`)
}
