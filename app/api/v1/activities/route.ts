import { NextRequest } from 'next/server'
import { authenticateApiRequest, corsPreflight, readJson, registerActivitySchema } from '@/lib/api-auth'
import { registerActivity } from '@/lib/activities'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { log } from '@/lib/logger'

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST(request: NextRequest) {
  try {
    const { project } = await authenticateApiRequest(request)
    const body = await readJson(request, registerActivitySchema)
    const result = await registerActivity({
      project,
      externalActivityId: body.activity_id,
      pushToken: body.push_token,
      type: body.type,
      expiresAt: body.expires_at ? new Date(body.expires_at) : undefined,
    })
    return jsonOk(result, 201)
  } catch (error) {
    if (!(error instanceof ApiError)) {
      log.error('register activity failed')
    }
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
