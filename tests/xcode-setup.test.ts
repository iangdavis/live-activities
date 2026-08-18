import { describe, expect, it } from 'vitest'
import {
  appStartSnippet,
  httpEndCurl,
  httpUpdateCurl,
  splitBundleId,
  SPM_PACKAGE_URL,
} from '@/lib/xcode-setup'
import { CANONICAL_API_BASE } from '@/lib/api-contract'
import { requirePathActivityId } from '@/lib/api-auth'
import { ApiError } from '@/lib/errors'

describe('xcode setup helpers', () => {
  it('splits a bundle id into org identifier and product name', () => {
    expect(splitBundleId('com.iandavis.livehive')).toEqual({
      bundleId: 'com.iandavis.livehive',
      orgIdentifier: 'com.iandavis',
      productName: 'livehive',
    })
    expect(splitBundleId('')).toEqual({
      bundleId: null,
      orgIdentifier: null,
      productName: null,
    })
  })

  it('embeds the public key and real activity id in copy-paste snippets', () => {
    expect(SPM_PACKAGE_URL).toBe('https://github.com/iangdavis/livehive-ios')
    const start = appStartSnippet('lh_pub_testkeyvalue1234567')
    expect(start).toContain('LiveHive.start(')
    expect(start).toContain('DeliveryAttributes()')
    expect(start).toContain('lh_pub_testkeyvalue1234567')
    expect(start).not.toContain('lh_live_')
    const curl = httpUpdateCurl('516AF584-1A18-43E2-B3FF-2295AE0D6FA2')
    expect(curl).toContain(CANONICAL_API_BASE)
    expect(curl).toContain('516AF584-1A18-43E2-B3FF-2295AE0D6FA2')
    expect(curl).not.toMatch(/\/activities\/\/update/)
    expect(httpEndCurl('abc')).toContain('/activities/abc/end')
  })
})

describe('requirePathActivityId', () => {
  it('rejects an empty path segment instead of redirecting', () => {
    expect(() => requirePathActivityId('')).toThrow(ApiError)
    expect(() => requirePathActivityId('  ')).toThrow(ApiError)
    expect(requirePathActivityId('order-1')).toBe('order-1')
  })
})
