import { NextRequest } from 'next/server'
import {
  authenticateApiRequest,
  corsPreflight,
  readJson,
  updateActivitySchema,
} from '@/lib/api-auth'
import { updateActivity } from '@/lib/activities'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { log } from '@/lib/logger'

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ activityId: string }> },
) {
  try {
    const { project } = await authenticateApiRequest(request)
    const { activityId } = await context.params
    const body = await readJson(request, updateActivitySchema)
    const result = await updateActivity({
      project,
      externalActivityId: activityId,
      contentState: body.content_state,
      alert: body.alert,
      staleDate: body.stale_date,
      relevanceScore: body.relevance_score,
    })
    return jsonOk(result)
  } catch (error) {
    if (!(error instanceof ApiError)) {
      log.error('update activity failed')
    }
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
