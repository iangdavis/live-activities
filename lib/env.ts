/**
 * Server-side environment access. Missing values throw only when a caller
 * actually needs them, so `next build` can still generate static pages.
 *
 * Read secrets with static `process.env.NAME` identifiers. Next.js does not
 * reliably expose `process.env[dynamicKey]` in the server bundle, which made
 * ENCRYPTION_KEY look missing on Vercel even after it was set.
 */

function normalize(value: string | undefined): string | undefined {
  if (!value) return undefined
  let next = value.trim()
  if (
    (next.startsWith('"') && next.endsWith('"') && next.length >= 2) ||
    (next.startsWith("'") && next.endsWith("'") && next.length >= 2)
  ) {
    next = next.slice(1, -1).trim()
  }
  return next.length > 0 ? next : undefined
}

function requireValue(name: string, value: string | undefined): string {
  const normalized = normalize(value)
  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return normalized
}

const HEX_64 = /^[0-9a-fA-F]{64}$/

export function encryptionKeyValue(): string | undefined {
  return normalize(process.env.ENCRYPTION_KEY)
}

export function encryptionKeyStatus(): { ok: true } | { ok: false; message: string } {
  const hex = encryptionKeyValue()
  if (!hex) {
    return {
      ok: false,
      message:
        'This server cannot read ENCRYPTION_KEY. In Vercel set it on Production (openssl rand -hex 32, 64 hex chars, no quotes), then Redeploy.',
    }
  }
  if (!HEX_64.test(hex)) {
    return {
      ok: false,
      message: `ENCRYPTION_KEY is set but invalid (${hex.length} characters after trimming; need exactly 64 hex 0-9a-f). Remove quotes and extra spaces, or regenerate with openssl rand -hex 32.`,
    }
  }
  return { ok: true }
}

export function isEncryptionKeyConfigured(): boolean {
  return encryptionKeyStatus().ok
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  get databaseUrl() {
    return requireValue('DATABASE_URL', process.env.DATABASE_URL)
  },
  get authSecret() {
    return requireValue('AUTH_SECRET', process.env.AUTH_SECRET)
  },
  get encryptionKey() {
    return requireValue('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY)
  },
  get cronSecret() {
    return requireValue('CRON_SECRET', process.env.CRON_SECRET)
  },
  get optionalCronSecret() {
    return normalize(process.env.CRON_SECRET)
  },
}

export function publicAppUrl(): string {
  const explicit = normalize(process.env.APP_URL)
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}
