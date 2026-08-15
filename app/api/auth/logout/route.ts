import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'
import { publicAppUrl } from '@/lib/env'

export async function POST(request: NextRequest) {
  await clearSessionCookie()
  const origin = request.headers.get('origin') || publicAppUrl()
  return NextResponse.redirect(new URL('/', origin), { status: 302 })
}
