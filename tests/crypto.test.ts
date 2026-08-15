import { describe, expect, it } from 'vitest'
import {
  decryptSecret,
  encryptSecret,
  generateApiKey,
  hashApiKey,
  isApiKeyFormat,
  tokenPreview,
} from '@/lib/crypto'

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
})

describe('token preview', () => {
  it('does not expose the full push token', () => {
    const token = 'a'.repeat(64)
    expect(tokenPreview(token)).toBe('••••aaaa')
    expect(tokenPreview(token).includes(token)).toBe(false)
  })
})
