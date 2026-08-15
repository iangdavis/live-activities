import { NextRequest } from 'next/server'
import { processQueuedDeliveries } from '@/lib/activities'
import { env } from '@/lib/env'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { log } from '@/lib/logger'

export async function GET(request: NextRequest) {
  return run(request)
}

export async function POST(request: NextRequest) {
  return run(request)
}

async function run(request: NextRequest) {
  const secret = env.optionalCronSecret
  const auth = request.headers.get('authorization')
  const urlSecret = new URL(request.url).searchParams.get('secret')
  const provided = auth?.replace(/^Bearer\s+/i, '') || urlSecret
  if (!secret || provided !== secret) {
    return jsonError(new ApiError(401, 'unauthorized', 'Unauthorized.'))
  }
  try {
    const processed = await processQueuedDeliveries()
    return jsonOk({ processed })
  } catch (error) {
    log.error('delivery cron failed')
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
