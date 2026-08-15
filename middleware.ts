import { NextResponse } from 'next/server'
import { getSessionFromCookieHeader } from '@/lib/session'

const PROTECTED = ['/dashboard']
const AUTH_PAGES = ['/login', '/signup']

export async function middleware(request: Request) {
  const url = new URL(request.url)
  const session = await getSessionFromCookieHeader(request.headers.get('cookie'))

  if (PROTECTED.some((path) => url.pathname.startsWith(path)) && !session) {
    const login = new URL('/login', url.origin)
    login.searchParams.set('next', url.pathname)
    return NextResponse.redirect(login)
  }

  if (AUTH_PAGES.includes(url.pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', url.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
