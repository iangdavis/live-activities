import { NextRequest } from 'next/server'
import { corsPreflight, handleActivityRegistration } from '@/lib/api-auth'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { log } from '@/lib/logger'

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST(request: NextRequest) {
  try {
    const result = await handleActivityRegistration(request, { allowPublic: true })
    return jsonOk(result, 201)
  } catch (error) {
    if (!(error instanceof ApiError)) {
      log.error('register activity failed')
    }
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
