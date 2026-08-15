import { describe, expect, it } from 'vitest'
import { signHs256, verifyHs256 } from '@/lib/jwt'

describe('session JWT', () => {
  it('round-trips a payload', async () => {
    const token = await signHs256({ sub: 'user_1', email: 'a@b.c' }, 'secret', 60)
    const payload = await verifyHs256(token, 'secret')
    expect(payload?.sub).toBe('user_1')
    expect(payload?.email).toBe('a@b.c')
  })

  it('rejects a bad signature', async () => {
    const token = await signHs256({ sub: 'user_1' }, 'secret', 60)
    expect(await verifyHs256(token, 'other')).toBeNull()
  })
})
