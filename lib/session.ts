import { cookies } from 'next/headers'
import { signHs256, verifyHs256 } from './jwt'

export const SESSION_COOKIE = 'lh_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14

export type SessionUser = {
  id: string
  email: string
  name: string | null
  accountId: string
}

function authSecret(): string | null {
  return process.env.AUTH_SECRET || null
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = authSecret()
  if (!secret) throw new Error('Missing required environment variable: AUTH_SECRET')
  return signHs256(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      accountId: user.accountId,
    },
    secret,
    SESSION_TTL_SECONDS,
  )
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  const secret = authSecret()
  if (!secret) return null
  const payload = await verifyHs256(token, secret)
  if (!payload) return null
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null
  if (typeof payload.accountId !== 'string') return null
  return {
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : null,
    accountId: payload.accountId,
  }
}

export async function getSession(): Promise<SessionUser | null> {
  if (!authSecret()) return null
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return readSessionToken(token)
}

export async function getSessionFromCookieHeader(
  cookieHeader: string | null,
): Promise<SessionUser | null> {
  if (!authSecret() || !cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))
  const token = match?.[1]
  if (!token) return null
  return readSessionToken(decodeURIComponent(token))
}
