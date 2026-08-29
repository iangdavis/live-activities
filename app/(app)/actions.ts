'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { getSession } from '@/lib/session'
import { createProject, updateProjectApns } from '@/lib/projects'
import { createApiKey, revokeApiKey } from '@/lib/api-keys'
import { ApiError } from '@/lib/errors'
import {
  endDashboardActivity,
  loadOwnedActivity,
  runDeliveryDriveTail,
  sendDashboardTestUpdate,
} from '@/lib/demo'

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
    redirect(`/projects/${project.id}`)
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof ApiError) {
      redirect(`/setup?create=1&error=${encodeURIComponent(error.message)}`)
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
    redirect(`/projects/${projectId}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message =
      error instanceof ApiError
        ? error.message
        : 'Could not save APNs settings. Check ENCRYPTION_KEY in Vercel (64 hex chars) and redeploy.'
    redirect(
      `/projects/${projectId}?error=${encodeURIComponent(message)}`,
    )
  }
}

export async function createApiKeyAction(formData: FormData): Promise<{
  plaintext?: string
  type?: 'PUBLIC' | 'SECRET'
  error?: string
}> {
  const session = await getSession()
  if (!session) return { error: 'Not signed in.' }
  const projectId = String(formData.get('projectId') || '')
  const name = String(formData.get('name') || 'Default')
  const type = String(formData.get('type') || 'SECRET') === 'PUBLIC' ? 'PUBLIC' : 'SECRET'
  try {
    const key = await createApiKey({
      accountId: session.accountId,
      userId: session.id,
      projectId,
      name,
      type,
    })
    revalidatePath(`/projects/${projectId}`)
    return { plaintext: key.plaintext, type: key.type }
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
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

function activityRedirect(activityId: string, query: string) {
  redirect(`/activities/${activityId}?${query}`)
}

function demoErrorQuery(error: unknown) {
  const message =
    error instanceof ApiError ? error.message : 'Could not send that update.'
  return `error=${encodeURIComponent(message)}`
}

export async function sendTestUpdateAction(formData: FormData) {
  const session = await sessionOrLogin()
  const activityId = String(formData.get('activityId') || '')
  try {
    await sendDashboardTestUpdate({
      accountId: session.accountId,
      userId: session.id,
      activityId,
    })
    revalidatePath(`/activities/${activityId}`)
    activityRedirect(activityId, 'demo=update')
  } catch (error) {
    unstable_rethrow(error)
    activityRedirect(activityId, demoErrorQuery(error))
  }
}

export async function endActivityAction(formData: FormData) {
  const session = await sessionOrLogin()
  const activityId = String(formData.get('activityId') || '')
  try {
    await endDashboardActivity({
      accountId: session.accountId,
      userId: session.id,
      activityId,
    })
    revalidatePath(`/activities/${activityId}`)
    activityRedirect(activityId, 'demo=end')
  } catch (error) {
    unstable_rethrow(error)
    activityRedirect(activityId, demoErrorQuery(error))
  }
}

export async function driveDeliveryDemoAction(formData: FormData) {
  const session = await sessionOrLogin()
  const activityId = String(formData.get('activityId') || '')
  try {
    const { activity, project } = await loadOwnedActivity(
      session.accountId,
      activityId,
    )
    await sendDashboardTestUpdate({
      accountId: session.accountId,
      userId: session.id,
      activityId,
    })
    after(() =>
      runDeliveryDriveTail({
        project,
        externalActivityId: activity.externalActivityId,
      }).catch(() => {}),
    )
    revalidatePath(`/activities/${activityId}`)
    activityRedirect(activityId, 'demo=drive')
  } catch (error) {
    unstable_rethrow(error)
    activityRedirect(activityId, demoErrorQuery(error))
  }
}
