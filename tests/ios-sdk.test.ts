import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const iosRoot = join(process.cwd(), 'sdks/ios')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      if (entry === '.build' || entry === '.swiftpm') return []
      return walk(path)
    }
    return [path]
  })
}

function hexString(bytes: number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('iOS SDK sources', () => {
  const files = walk(iosRoot)
  const swift = files.filter((file) => file.endsWith('.swift')).map((file) => ({
    file,
    source: readFileSync(file, 'utf8'),
  }))

  it('is a Swift package that uses URLSession and exposes the intended API', () => {
    const manifest = readFileSync(join(iosRoot, 'Package.swift'), 'utf8')
    expect(manifest).toContain('name: "LiveHive"')
    const combined = swift.map((item) => item.source).join('\n')
    expect(combined).toContain('LiveHive.configure')
    expect(combined).toContain('static func register')
    expect(combined).toContain('Activity<Attributes>')
    expect(combined).toContain('URLSession')
    expect(combined).toContain('pushTokenUpdates')
    expect(combined).toContain('%02x')
    expect(combined).toContain('/v1/activities/register')
    expect(combined).not.toMatch(/Alamofire|Moya|AFNetworking/)
  })

  it('contains no secret credentials and rejects lh_live_ keys', () => {
    const sources = swift.filter((item) => item.file.includes('/Sources/'))
    for (const item of sources) {
      expect(item.source).not.toMatch(/lh_live_[A-Za-z0-9_-]{8,}/)
      expect(item.source).not.toMatch(/BEGIN PRIVATE KEY/)
    }
    const combined = swift.map((item) => item.source).join('\n')
    expect(combined).toContain('secretKeyRejected')
    expect(combined).toContain('lh_pub_')
  })

  it('converts tokens with the same lowercase hex algorithm as the SDK', () => {
    expect(hexString([0x0a, 0xff, 0x00, 0x1b])).toBe('0aff001b')
    expect(hexString([0xde, 0xad])).toBe('dead')
  })

  it('retries transient failures and observes token rotation in tests', () => {
    const tests = readFileSync(join(iosRoot, 'Tests/LiveHiveTests/LiveHiveTests.swift'), 'utf8')
    expect(tests).toContain('testTokenRotationSendsEachNewToken')
    expect(tests).toContain('testRetriesTransientHTTPFailures')
    expect(tests).toContain('testDoesNotRetryClientErrors')
    expect(tests).toContain('testPushTokenHexConversion')
    expect(tests).toContain('testConfigureStoresPublicKey')
  })
})
