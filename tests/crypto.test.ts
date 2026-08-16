import { describe, expect, it } from 'vitest'
import {
  decryptSecret,
  encryptSecret,
  generateApiKey,
  hashApiKey,
  isApiKeyFormat,
  tokenPreview,
} from '@/lib/crypto'
import { ApiError } from '@/lib/errors'

describe('API keys', () => {
  it('generates hashed live keys and never stores plaintext', () => {
    const key = generateApiKey()
    expect(key.plaintext.startsWith('lh_live_')).toBe(true)
    expect(isApiKeyFormat(key.plaintext)).toBe(true)
    expect(hashApiKey(key.plaintext)).toBe(key.hash)
    expect(key.hash).not.toContain(key.plaintext)
    expect(key.prefix.startsWith('lh_live_')).toBe(true)
  })

  it('rejects non-live key formats', () => {
    expect(isApiKeyFormat('sk_live_abc')).toBe(false)
    expect(isApiKeyFormat('lh_live_short')).toBe(false)
  })
})

describe('secret encryption', () => {
  it('round-trips APNs key material', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----'
    const encrypted = encryptSecret(pem)
    expect(encrypted).not.toContain('PRIVATE KEY')
    expect(decryptSecret(encrypted)).toBe(pem)
  })

  it('throws a clear ApiError when ENCRYPTION_KEY is missing', () => {
    const previous = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    try {
      expect(() => encryptSecret('secret')).toThrow(ApiError)
      try {
        encryptSecret('secret')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(503)
        expect((error as ApiError).message).toMatch(/ENCRYPTION_KEY/)
      }
    } finally {
      process.env.ENCRYPTION_KEY = previous
    }
  })

  it('throws a clear ApiError when ENCRYPTION_KEY is not 64 hex characters', () => {
    const previous = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = 'not-64-hex'
    try {
      expect(() => encryptSecret('secret')).toThrow(ApiError)
      try {
        encryptSecret('secret')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(503)
        expect((error as ApiError).message).toMatch(/64 hex/)
      }
    } finally {
      process.env.ENCRYPTION_KEY = previous
    }
  })

  it('accepts quoted or whitespace-padded 64-hex keys from Vercel pastes', () => {
    const previous = process.env.ENCRYPTION_KEY
    const hex = 'ab'.repeat(32)
    const pem = '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----'
    try {
      process.env.ENCRYPTION_KEY = ` "${hex}" \n`
      expect(decryptSecret(encryptSecret(pem))).toBe(pem)
    } finally {
      process.env.ENCRYPTION_KEY = previous
    }
  })
})

describe('token preview', () => {
  it('does not expose the full push token', () => {
    const token = 'a'.repeat(64)
    expect(tokenPreview(token)).toBe('••••aaaa')
    expect(tokenPreview(token).includes(token)).toBe(false)
  })
})
