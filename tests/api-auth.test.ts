import { describe, expect, it } from 'vitest'
import { requireSecretApiKey, type ApiAuth } from '@/lib/api-auth'
import { ApiError } from '@/lib/errors'
import type { Project } from '@prisma/client'

function auth(keyType: 'PUBLIC' | 'SECRET'): ApiAuth {
  return {
    project: { id: 'proj' } as Project,
    apiKeyId: 'key',
    keyType,
  }
}

describe('API key authorization', () => {
  it('allows secret keys', () => {
    expect(() => requireSecretApiKey(auth('SECRET'))).not.toThrow()
  })

  it('rejects public keys for privileged operations', () => {
    try {
      requireSecretApiKey(auth('PUBLIC'))
      throw new Error('expected forbidden')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(403)
      expect((error as ApiError).code).toBe('forbidden')
    }
  })
})
