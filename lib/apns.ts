import http2 from 'node:http2'
import { importPKCS8, SignJWT } from 'jose'
import { log } from './logger'

export type ApnsEnvironmentName = 'sandbox' | 'production'

export type ApnsCredentials = {
  teamId: string
  keyId: string
  privateKeyPem: string
  bundleId: string
  environment: ApnsEnvironmentName
}

export type LiveActivityPush = {
  deviceToken: string
  event: 'update' | 'end'
  contentState?: Record<string, unknown>
  alert?: { title?: string; body?: string; sound?: string }
  staleDate?: number
  relevanceScore?: number
  dismissalDate?: number
  timestamp?: number
}

export type ApnsResult =
  | { ok: true; status: number }
  | { ok: false; status: number; reason: string; error: string }

export interface ApnsSender {
  sendLiveActivity(credentials: ApnsCredentials, push: LiveActivityPush): Promise<ApnsResult>
}

const APNS_HOSTS: Record<ApnsEnvironmentName, string> = {
  sandbox: 'api.sandbox.push.apple.com',
  production: 'api.push.apple.com',
}

type CachedJwt = { token: string; expiresAt: number; fingerprint: string }

let jwtCache: CachedJwt | null = null

function fingerprint(creds: ApnsCredentials): string {
  return `${creds.teamId}:${creds.keyId}:${creds.environment}`
}

function sanitizeKeyInput(input: string): string {
  return input.trim().replace(/^['"]|['"]$/g, '')
}

function decodeMaybeBase64(input: string): string | null {
  const compact = input.replace(/\s+/g, '')
  if (!compact || compact.length % 4 !== 0) return null
  if (!/^[A-Za-z0-9+/=]+$/.test(compact)) return null
  try {
    const decoded = Buffer.from(compact, 'base64').toString('utf8').trim()
    return decoded.length > 0 ? decoded : null
  } catch {
    return null
  }
}

function toPemBody(input: string): string {
  const compact = input.replace(/\s+/g, '')
  const lines = compact.match(/.{1,64}/g)?.join('\n') ?? compact
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`
}

function candidatePrivateKeys(raw: string): string[] {
  const cleaned = sanitizeKeyInput(raw)
  const candidates = new Set<string>()

  candidates.add(cleaned)
  candidates.add(cleaned.replace(/\\n/g, '\n'))

  const decoded = decodeMaybeBase64(cleaned)
  if (decoded) {
    candidates.add(decoded)
    candidates.add(decoded.replace(/\\n/g, '\n'))
  }

  for (const candidate of Array.from(candidates)) {
    if (candidate.includes('BEGIN PRIVATE KEY') || candidate.includes('BEGIN EC PRIVATE KEY')) {
      candidates.add(candidate)
      candidates.add(candidate.replace(/\r\n/g, '\n'))
    } else {
      candidates.add(toPemBody(candidate))
    }
  }

  return Array.from(candidates)
}

async function importSigningKey(rawPrivateKey: string): Promise<CryptoKey> {
  let lastError: unknown
  for (const candidate of candidatePrivateKeys(rawPrivateKey)) {
    try {
      return await importPKCS8(candidate, 'ES256')
    } catch (error) {
      lastError = error
    }
  }

  log.error('apns private key import failed', {
    keyShape: {
      startsWithBeginMarker: rawPrivateKey.includes('BEGIN PRIVATE KEY') || rawPrivateKey.includes('BEGIN EC PRIVATE KEY'),
      hasLiteralNewlines: rawPrivateKey.includes('\n'),
      hasRealNewlines: rawPrivateKey.includes('\n') && rawPrivateKey.includes('\r') ? false : rawPrivateKey.includes('\n'),
      length: rawPrivateKey.length,
    },
    error: lastError instanceof Error ? { name: lastError.name, message: lastError.message } : { name: 'UnknownError' },
  })
  throw lastError instanceof Error ? lastError : new Error('Invalid APNs private key')
}

export async function createApnsJwt(creds: ApnsCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fp = fingerprint(creds)
  if (jwtCache && jwtCache.fingerprint === fp && jwtCache.expiresAt - 60 > now) {
    return jwtCache.token
  }
  const key = await importSigningKey(creds.privateKeyPem)
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: creds.keyId })
    .setIssuer(creds.teamId)
    .setIssuedAt(now)
    .sign(key)
  jwtCache = { token, expiresAt: now + 50 * 60, fingerprint: fp }
  return token
}

export function normalizePem(input: string): string {
  const trimmed = input.replace(/\\n/g, '\n').trim()
  if (trimmed.includes('BEGIN PRIVATE KEY') || trimmed.includes('BEGIN EC PRIVATE KEY')) {
    return trimmed
  }
  const body = trimmed.replace(/\s+/g, '')
  const lines = body.match(/.{1,64}/g)?.join('\n') ?? body
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`
}

export function normalizePushToken(token: string): string {
  return token.replace(/\s+/g, '').toLowerCase()
}

export function apnsHost(environment: ApnsEnvironmentName): string {
  return process.env.APNS_HOST || APNS_HOSTS[environment]
}

function buildApsPayload(push: LiveActivityPush): Record<string, unknown> {
  const timestamp = push.timestamp ?? Math.floor(Date.now() / 1000)
  const aps: Record<string, unknown> = {
    timestamp,
    event: push.event,
  }
  if (push.contentState) aps['content-state'] = push.contentState
  if (push.alert) aps.alert = push.alert
  if (typeof push.staleDate === 'number') aps['stale-date'] = push.staleDate
  if (typeof push.relevanceScore === 'number') aps['relevance-score'] = push.relevanceScore
  if (typeof push.dismissalDate === 'number') aps['dismissal-date'] = push.dismissalDate
  return { aps }
}

export class Http2ApnsSender implements ApnsSender {
  async sendLiveActivity(
    credentials: ApnsCredentials,
    push: LiveActivityPush,
  ): Promise<ApnsResult> {
    const token = normalizePushToken(push.deviceToken)
    if (!/^[0-9a-f]{64,}$/i.test(token)) {
      return {
        ok: false,
        status: 400,
        reason: 'BadDeviceToken',
        error: 'Push token is not a valid APNs device token.',
      }
    }

    const host = apnsHost(credentials.environment)
    const jwt = await createApnsJwt(credentials)
    const body = JSON.stringify(buildApsPayload(push))
    const topic = `${credentials.bundleId}.push-type.liveactivity`

    return new Promise((resolve) => {
      let settled = false
      const finish = (result: ApnsResult) => {
        if (settled) return
        settled = true
        resolve(result)
      }

      const client = http2.connect(`https://${host}`)
      const timeout = setTimeout(() => {
        client.close()
        finish({
          ok: false,
          status: 0,
          reason: 'Timeout',
          error: 'APNs request timed out.',
        })
      }, 8_000)

      client.on('error', (err) => {
        clearTimeout(timeout)
        log.error('apns connection error', { host, message: err.message })
        finish({
          ok: false,
          status: 0,
          reason: 'ConnectionError',
          error: 'Could not connect to APNs.',
        })
      })

      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${token}`,
        authorization: `bearer ${jwt}`,
        'apns-topic': topic,
        'apns-push-type': 'liveactivity',
        'apns-priority': '10',
        'content-type': 'application/json',
      })

      let status = 0
      const chunks: Buffer[] = []

      req.on('response', (headers) => {
        status = Number(headers[':status'] ?? 0)
      })
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('error', (err) => {
        clearTimeout(timeout)
        client.close()
        finish({
          ok: false,
          status: 0,
          reason: 'RequestError',
          error: err.message || 'APNs request failed.',
        })
      })
      req.on('end', () => {
        clearTimeout(timeout)
        client.close()
        const raw = Buffer.concat(chunks).toString('utf8')
        let reason = ''
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { reason?: string }
            reason = parsed.reason ?? raw.slice(0, 200)
          } catch {
            reason = raw.slice(0, 200)
          }
        }
        if (status >= 200 && status < 300) {
          finish({ ok: true, status })
          return
        }
        finish({
          ok: false,
          status,
          reason: reason || 'Unknown',
          error: reason ? `APNs rejected the push (${reason}).` : 'APNs rejected the push.',
        })
      })

      req.end(body)
    })
  }
}

let sender: ApnsSender = new Http2ApnsSender()

export function getApnsSender(): ApnsSender {
  return sender
}

export function setApnsSender(next: ApnsSender) {
  sender = next
}

export function resetApnsJwtCache() {
  jwtCache = null
}
