import { describe, expect, it, vi } from 'vitest'
import { log } from '@/lib/logger'

describe('logger redaction', () => {
  it('does not print API keys or APNs private keys', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('test', {
      authorization: 'Bearer lh_live_supersecret',
      apnsKey: '-----BEGIN PRIVATE KEY-----\nSECRET\n-----END PRIVATE KEY-----',
      api_key: 'lh_live_supersecret',
      note: 'lh_pub_supersecret',
    })
    const printed = spy.mock.calls[0]?.[0] as string
    expect(printed).toContain('[redacted]')
    expect(printed).not.toContain('supersecret')
    expect(printed).not.toContain('BEGIN PRIVATE KEY')
    expect(printed).not.toContain('lh_pub_supersecret')
    spy.mockRestore()
  })
})
