import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from './env'
import { ApiError } from './errors'

const API_KEY_PREFIX = 'lh_live_'

export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex')
}

export function generateApiKey(): {
  plaintext: string
  hash: string
  prefix: string
} {
  const secret = randomBytes(24).toString('base64url')
  const plaintext = `${API_KEY_PREFIX}${secret}`
  return {
    plaintext,
    hash: hashApiKey(plaintext),
    prefix: plaintext.slice(0, 16),
  }
}

export function isApiKeyFormat(value: string): boolean {
  return value.startsWith(API_KEY_PREFIX) && value.length >= 24
}

export function generatePublicId(prefix: string): string {
  return `${prefix}_${randomBytes(9).toString('base64url')}`
}

function encryptionKey(): Buffer {
  let hex: string
  try {
    hex = env.encryptionKey
  } catch {
    throw new ApiError(
      503,
      'misconfigured',
      'Server cannot read ENCRYPTION_KEY. Set it on Vercel Production (openssl rand -hex 32) and Redeploy.',
    )
  }
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new ApiError(
      503,
      'misconfigured',
      `ENCRYPTION_KEY is set but invalid (${hex.length} characters; need 64 hex from openssl rand -hex 32, no quotes).`,
    )
  }
  return Buffer.from(hex, 'hex')
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

export function decryptSecret(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(':')
  if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted payload')
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(ivB64, 'base64'),
  )
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ])
  return plaintext.toString('utf8')
}

export function tokenPreview(token: string): string {
  if (token.length <= 8) return '••••'
  return `••••${token.slice(-4)}`
}
