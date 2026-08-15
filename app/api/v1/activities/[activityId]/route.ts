import { NextRequest } from 'next/server'
import { authenticateApiRequest, corsPreflight } from '@/lib/api-auth'
import { getActivityPublic } from '@/lib/activities'
import { jsonError, jsonOk } from '@/lib/errors'

export async function OPTIONS() {
  return corsPreflight()
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ activityId: string }> },
) {
  try {
    const { project } = await authenticateApiRequest(request)
    const { activityId } = await context.params
    const activity = await getActivityPublic(project.id, activityId)
    return jsonOk(activity)
  } catch (error) {
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
