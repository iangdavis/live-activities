import { NextRequest } from 'next/server'
import {
  authenticateApiRequest,
  corsPreflight,
  readJson,
  requirePathActivityId,
  requireSecretApiKey,
  updateActivitySchema,
} from '@/lib/api-auth'
import { activityRegistrationWaitMs, updateActivity } from '@/lib/activities'
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
    const auth = await authenticateApiRequest(request)
    requireSecretApiKey(auth)
    const { activityId } = await context.params
    const body = await readJson(request, updateActivitySchema)
    const result = await updateActivity({
      project: auth.project,
      externalActivityId: requirePathActivityId(activityId),
      contentState: body.content_state,
      alert: body.alert,
      staleDate: body.stale_date,
      relevanceScore: body.relevance_score,
      waitForRegistrationMs: activityRegistrationWaitMs(),
    })
    return jsonOk(result)
  } catch (error) {
    if (!(error instanceof ApiError)) {
      log.error('update activity failed')
    }
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
