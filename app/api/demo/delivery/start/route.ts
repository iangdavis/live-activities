import { after } from 'next/server'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { log } from '@/lib/logger'
import { projectFromDemoApiKey, runDemoLifecycle } from '@/lib/demo-delivery'

export const maxDuration = 60

const DEMO_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: DEMO_HEADERS })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      activity_id?: unknown
    } | null
    const activityId = String(body?.activity_id || '').trim()
    if (!activityId) {
      throw new ApiError(400, 'invalid_request', 'activity_id is required.')
    }

    const project = await projectFromDemoApiKey()
    after(() =>
      runDemoLifecycle(project, activityId).catch((error) => {
        log.error('demo delivery lifecycle failed', {
          activityId,
          err: error instanceof Error ? error.message : 'unknown',
        })
      }),
    )

    return jsonOk({ ok: true, activity_id: activityId }, 202)
  } catch (error) {
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
