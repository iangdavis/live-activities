import { generateKeyPairSync } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { createApnsJwt, normalizePem, normalizePushToken, resetApnsJwtCache } from '@/lib/apns'

describe('APNs helpers', () => {
  it('normalizes hex push tokens', () => {
    expect(normalizePushToken('AA BB CC')).toBe('aabbcc')
  })

  it('wraps raw p8 bodies as PEM', () => {
    const pem = normalizePem('a'.repeat(80))
    expect(pem.includes('BEGIN PRIVATE KEY')).toBe(true)
  })

  it('signs an ES256 provider token', async () => {
    resetApnsJwtCache()
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const jwt = await createApnsJwt({
      teamId: 'TEAM123456',
      keyId: 'KEY1234567',
      privateKeyPem: pem,
      bundleId: 'com.example.app',
      environment: 'sandbox',
    })
    const [header] = jwt.split('.')
    const decoded = JSON.parse(Buffer.from(header, 'base64url').toString())
    expect(decoded.alg).toBe('ES256')
    expect(decoded.kid).toBe('KEY1234567')
  })
})
