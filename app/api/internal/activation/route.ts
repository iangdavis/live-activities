import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { EVENTS } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const secret = env.optionalCronSecret
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!secret || auth !== secret) {
    return jsonError(new ApiError(401, 'unauthorized', 'Unauthorized.'))
  }

  const [firstSuccessful, signups, projects, updates] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { name: EVENTS.FIRST_SUCCESSFUL_LIVE_ACTIVITY_UPDATE },
    }),
    prisma.analyticsEvent.count({ where: { name: EVENTS.SIGNUP } }),
    prisma.analyticsEvent.count({ where: { name: EVENTS.PROJECT_CREATED } }),
    prisma.analyticsEvent.count({ where: { name: EVENTS.FIRST_UPDATE_ATTEMPTED } }),
  ])

  return jsonOk({
    FIRST_SUCCESSFUL_LIVE_ACTIVITY_UPDATE: firstSuccessful,
    SIGNUP: signups,
    PROJECT_CREATED: projects,
    FIRST_UPDATE_ATTEMPTED: updates,
  })
}
