import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateUser, createUserWithAccount, setSessionCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiError, jsonError, jsonOk } from '@/lib/errors'
import { EVENTS, track } from '@/lib/analytics'
import { clientIp, limits, rateLimit } from '@/lib/rate-limit'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(80).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const limited = rateLimit(`auth:${ip}`, limits.auth.limit, limits.auth.windowMs)
  if (!limited.ok) {
    return jsonError(new ApiError(429, 'rate_limited', 'Too many attempts. Try again shortly.'))
  }

  const url = new URL(request.url)
  const action = url.searchParams.get('action') || 'login'

  try {
    const body = await request.json()
    if (action === 'signup') {
      const parsed = signupSchema.safeParse(body)
      if (!parsed.success) {
        throw new ApiError(400, 'invalid_request', 'Enter a valid email and a password of at least 8 characters.')
      }
      const existing = await prisma.user.findUnique({
        where: { email: parsed.data.email.trim().toLowerCase() },
        select: { id: true },
      })
      if (existing) {
        throw new ApiError(409, 'email_taken', 'An account with that email already exists.')
      }
      const user = await createUserWithAccount(parsed.data)
      await setSessionCookie(user)
      await track({
        name: EVENTS.SIGNUP,
        userId: user.id,
        accountId: user.accountId,
      })
      return jsonOk({ ok: true })
    }

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(400, 'invalid_request', 'Enter your email and password.')
    }
    const user = await authenticateUser(parsed.data.email, parsed.data.password)
    if (!user) {
      throw new ApiError(401, 'invalid_credentials', 'Email or password is incorrect.')
    }
    await setSessionCookie(user)
    return jsonOk({ ok: true })
  } catch (error) {
    return jsonError(error instanceof Error ? error : new Error('unknown'))
  }
}
