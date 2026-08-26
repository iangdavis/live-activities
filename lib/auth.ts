import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { env } from './env'
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  type SessionUser,
} from './session'

export type { SessionUser }
export { getSession } from './session'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function requireSession(): Promise<SessionUser> {
  const { getSession } = await import('./session')
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHENTICATED')
  }
  return session
}

export async function createUserWithAccount(input: {
  email: string
  password: string
  name?: string
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase()
  const passwordHash = await hashPassword(input.password)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
      accounts: {
        create: {
          name: input.name?.trim() || email.split('@')[0] || 'Personal',
          plan: 'free',
        },
      },
    },
    include: { accounts: true },
  })
  const account = user.accounts[0]
  if (!account) {
    throw new Error('Failed to create account')
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    accountId: account.id,
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { accounts: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  if (!user) return null
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return null
  const account = user.accounts[0]
  if (!account) return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    accountId: account.id,
  }
}
