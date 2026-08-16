import { describe, expect, it, vi } from 'vitest'
import { LiveHive, LiveHiveError } from '../sdks/node/src/index'

describe('Node SDK', () => {
  it('rejects public keys and missing keys', () => {
    expect(() => new LiveHive({ apiKey: 'lh_pub_abcdefghijklmnopqrstuv' })).toThrow(
      /server API key/,
    )
    expect(() => new LiveHive({ apiKey: '' })).toThrow(LiveHiveError)
    expect(() => new LiveHive({ apiKey: 'nope' })).toThrow(/lh_live_/)
  })

  it('sends update and end as content_state with the secret key', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer lh_live_testkeyvalue123456',
        'Content-Type': 'application/json',
      })
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      if (url.endsWith('/update')) {
        expect(body.content_state).toEqual({ status: 'driver_arriving', eta: 4 })
        return new Response(
          JSON.stringify({ id: 'upd_1', activity_id: 'abc123', status: 'sent' }),
          { status: 200 },
        )
      }
      expect(body.content_state).toEqual({ status: 'delivered', eta: 0 })
      return new Response(
        JSON.stringify({ id: 'end_1', activity_id: 'abc123', status: 'sent' }),
        { status: 200 },
      )
    })

    const livehive = new LiveHive({
      apiKey: 'lh_live_testkeyvalue123456',
      fetch: fetchImpl as unknown as typeof fetch,
    })

    const updated = await livehive.activities.update('abc123', {
      status: 'driver_arriving',
      eta: 4,
    })
    expect(updated.status).toBe('sent')

    const ended = await livehive.activities.end('abc123', {
      status: 'delivered',
      eta: 0,
    })
    expect(ended.id).toBe('end_1')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('surfaces API errors', async () => {
    const livehive = new LiveHive({
      apiKey: 'lh_live_testkeyvalue123456',
      fetch: (async () =>
        new Response(JSON.stringify({ error: { code: 'forbidden', message: 'nope' } }), {
          status: 403,
        })) as unknown as typeof fetch,
    })
    try {
      await livehive.activities.update('abc123', { status: 'x' })
      throw new Error('expected failure')
    } catch (error) {
      expect(error).toBeInstanceOf(LiveHiveError)
      expect((error as LiveHiveError).status).toBe(403)
      expect((error as LiveHiveError).code).toBe('forbidden')
    }
  })

  it('defaults to the production API origin', () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe('https://api.livehive.dev/v1/activities/abc/update')
      return new Response(JSON.stringify({ id: 'upd_1', activity_id: 'abc', status: 'sent' }))
    })
    const livehive = new LiveHive({
      apiKey: 'lh_live_testkeyvalue123456',
      fetch: fetchImpl as unknown as typeof fetch,
    })
    return livehive.activities.update('abc', { status: 'ok' })
  })
})
