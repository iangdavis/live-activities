/**
 * Server-side environment access. Missing values throw only when a caller
 * actually needs them, so `next build` can still generate static pages.
 */

function read(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

function requireEnv(name: string): string {
  const value = read(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  get databaseUrl() {
    return requireEnv('DATABASE_URL')
  },
  get authSecret() {
    return requireEnv('AUTH_SECRET')
  },
  get encryptionKey() {
    return requireEnv('ENCRYPTION_KEY')
  },
  get cronSecret() {
    return requireEnv('CRON_SECRET')
  },
  get optionalCronSecret() {
    return read('CRON_SECRET')
  },
}

export function publicAppUrl(): string {
  const explicit = read('APP_URL')
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = read('VERCEL_PROJECT_PRODUCTION_URL')
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}
