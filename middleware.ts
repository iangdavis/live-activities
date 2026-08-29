import { NextResponse } from 'next/server'
import { getSessionFromCookieHeader } from '@/lib/session'

const AUTH_PAGES = ['/login', '/signup']

function isAppPath(pathname: string) {
  return (
    pathname === '/welcome' ||
    pathname.startsWith('/welcome/') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/projects' ||
    pathname.startsWith('/projects/') ||
    pathname === '/activities' ||
    pathname.startsWith('/activities/') ||
    pathname === '/logs' ||
    pathname.startsWith('/logs/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/') ||
    pathname === '/api-keys' ||
    pathname.startsWith('/api-keys/')
  )
}

export async function middleware(request: Request) {
  const url = new URL(request.url)
  const session = await getSessionFromCookieHeader(request.headers.get('cookie'))

  if (isAppPath(url.pathname) && !session) {
    const login = new URL('/login', url.origin)
    login.searchParams.set('next', url.pathname + url.search)
    return NextResponse.redirect(login)
  }

  if (AUTH_PAGES.includes(url.pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', url.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/projects',
    '/projects/:path*',
    '/activities',
    '/activities/:path*',
    '/logs',
    '/logs/:path*',
    '/settings',
    '/settings/:path*',
    '/api-keys',
    '/api-keys/:path*',
    '/welcome',
    '/welcome/:path*',
    '/login',
    '/signup',
  ],
}
