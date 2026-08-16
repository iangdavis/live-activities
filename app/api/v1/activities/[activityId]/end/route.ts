import { NextRequest } from 'next/server'
import {
  authenticateApiRequest,
  corsPreflight,
  endActivitySchema,
  requireSecretApiKey,
} from '@/lib/api-auth'
import { endActivity } from '@/lib/activities'
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
    let body: { content_state?: Record<string, unknown>; dismissal_date?: number } = {}
    const text = await request.text()
    if (text.trim()) {
      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        throw new ApiError(400, 'invalid_json', 'Request body must be valid JSON.')
      }
      const parsed = endActivitySchema.safeParse(json)
      if (!parsed.success) {
        throw new ApiError(400, 'invalid_request', 'Request validation failed.', parsed.error.flatten())
      }
      body = {
        content_state: parsed.data.content_state,
        dismissal_date: parsed.data.dismissal_date,
      }
    }
    const result = await endActivity({
      project: auth.project,
      externalActivityId: activityId,
      contentState: body.content_state,
      dismissalDate: body.dismissal_date,
    })
    return jsonOk(result)
  } catch (error) {
    if (!(error instanceof ApiError)) {
      log.error('end activity failed')
    }
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
