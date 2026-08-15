import { NextRequest } from 'next/server'
import { EVENTS, track } from '@/lib/analytics'
import { jsonOk } from '@/lib/errors'

export async function POST(request: NextRequest) {
  let name = ''
  try {
    const body = (await request.json()) as { name?: string; path?: string }
    name = body.name || ''
    if (name === EVENTS.LANDING_PAGE_VISIT || name === EVENTS.DOCUMENTATION_VIEWED) {
      await track({
        name,
        properties: { path: body.path },
      })
    }
  } catch {
    // ignore
  }
  return jsonOk({ ok: true })
}
