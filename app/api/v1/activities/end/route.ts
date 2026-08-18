import { ApiError, jsonError } from '@/lib/errors'
import { corsPreflight } from '@/lib/api-auth'

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST() {
  return jsonError(
    new ApiError(
      400,
      'invalid_request',
      'activity_id is required in the URL path. Example: /v1/activities/YOUR-UUID/end',
    ),
  )
}
