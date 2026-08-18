import { CANONICAL_API_BASE } from '@/lib/api-contract'
import { LLMS_TXT } from '@/lib/llms-txt'
import { openApiDocument } from '@/lib/openapi'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('agent contract', () => {
  it('llms.txt states the golden path, keys, and do-not list', () => {
    expect(LLMS_TXT).toContain('No server SDK')
    expect(LLMS_TXT).toContain(CANONICAL_API_BASE)
    expect(LLMS_TXT).toContain('lh_pub_')
    expect(LLMS_TXT).toContain('lh_live_')
    expect(LLMS_TXT).toContain('POST /v1/activities/register')
    expect(LLMS_TXT).toContain('POST /v1/activities/{activity_id}/update')
    expect(LLMS_TXT).toContain('POST /v1/activities/{activity_id}/end')
    expect(LLMS_TXT).toContain('Do not put lh_live_ in the iOS app')
    expect(LLMS_TXT).toContain('Do not look for a server SDK')
    expect(LLMS_TXT).toContain('Do not build a token-forwarding')
    expect(LLMS_TXT).not.toContain('https://livehive.dev/api/v1/activities')
    expect(LLMS_TXT).toContain('https://github.com/iangdavis/livehive-ios.git from 0.1.1')
  })

  it('OpenAPI documents the golden-path routes on the canonical host', () => {
    expect(openApiDocument.servers[0]?.url).toBe(CANONICAL_API_BASE)
    expect(openApiDocument.paths['/activities/register']).toBeTruthy()
    expect(openApiDocument.paths['/activities/{activity_id}/update']).toBeTruthy()
    expect(openApiDocument.paths['/activities/{activity_id}/end']).toBeTruthy()
    expect(openApiDocument.paths['/activities']?.post?.deprecated).toBe(true)
  })

  it('does not ship a Node SDK and uses the canonical API host in HTTP snippets', () => {
    expect(existsSync('sdks/node')).toBe(false)
    const snippets = readFileSync('components/docs/BackendSnippet.tsx', 'utf8')
    expect(snippets).toContain(CANONICAL_API_BASE)
    expect(snippets).not.toContain('https://livehive.dev/api/v1')
    expect(snippets).not.toContain("from 'livehive'")
    expect(snippets).not.toContain('function livehive')
    expect(snippets).not.toContain('def livehive')
    expect(snippets).not.toContain('func livehive')
    expect(snippets).toContain('await fetch("https://www.livehive.dev/v1/activities/abc123/update"')
  })

  it('getting started installs the published Swift package, not this repo', () => {
    const page = readFileSync('app/docs/getting-started/page.tsx', 'utf8')
    expect(page).toContain('IOS_SDK_PACKAGE_URL')
    expect(page).toContain('IOS_SDK_VERSION')
    expect(page).toContain('File → Add Package Dependencies')
    expect(page).toContain('print(activity.id)')
    expect(page).not.toContain('from sdks/ios')
    expect(page).not.toContain('Add Local')
  })
})
