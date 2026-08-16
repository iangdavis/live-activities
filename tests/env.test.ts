import { describe, expect, it } from 'vitest'
import { encryptionKeyStatus, isEncryptionKeyConfigured } from '@/lib/env'

describe('ENCRYPTION_KEY status', () => {
  it('reports missing when unset', () => {
    const previous = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    try {
      expect(isEncryptionKeyConfigured()).toBe(false)
      const status = encryptionKeyStatus()
      expect(status.ok).toBe(false)
      if (!status.ok) expect(status.message).toMatch(/cannot read ENCRYPTION_KEY/)
    } finally {
      process.env.ENCRYPTION_KEY = previous
    }
  })

  it('reports invalid length without leaking the value', () => {
    const previous = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = 'abc123'
    try {
      const status = encryptionKeyStatus()
      expect(status.ok).toBe(false)
      if (!status.ok) {
        expect(status.message).toMatch(/6 characters/)
        expect(status.message).not.toContain('abc123')
      }
    } finally {
      process.env.ENCRYPTION_KEY = previous
    }
  })

  it('treats quoted 64-hex as configured', () => {
    const previous = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = `"${'ab'.repeat(32)}"`
    try {
      expect(isEncryptionKeyConfigured()).toBe(true)
      expect(encryptionKeyStatus()).toEqual({ ok: true })
    } finally {
      process.env.ENCRYPTION_KEY = previous
    }
  })
})
