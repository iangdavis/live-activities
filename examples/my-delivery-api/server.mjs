#!/usr/bin/env node
/**
 * Local My Delivery API. Production is a separate Vercel project (this folder).
 * POST /demo/start { activity_id } → 202, then update at T+10s, end at T+20s.
 */
import http from 'node:http'
import { demoStepMs, keyConfigured, liveHiveBase, runLifecycle } from './lib/lifecycle.mjs'

const PORT = Number(process.env.PORT || 8787)
const DELAY_MS = demoStepMs()

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'Authorization, Content-Type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
}

function send(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body)
  res.writeHead(status, {
    ...CORS,
    'content-type': 'application/json',
  })
  res.end(payload)
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return {}
  return JSON.parse(raw)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'OPTIONS') {
    send(res, 204)
    return
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    send(res, 200, {
      ok: true,
      base: liveHiveBase(),
      delay_ms: DELAY_MS,
      key_configured: keyConfigured(),
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/demo/start') {
    if (!keyConfigured()) {
      send(res, 500, { error: 'Set LIVEHIVE_API_KEY to a lh_live_ server key' })
      return
    }
    let body
    try {
      body = await readJson(req)
    } catch {
      send(res, 400, { error: 'invalid json' })
      return
    }
    const activityId = String(body.activity_id || '').trim()
    if (!activityId) {
      send(res, 400, { error: 'activity_id required' })
      return
    }
    send(res, 202, { ok: true, activity_id: activityId })

    // Run lifecycle asynchronously. If we're on Vercel Hobby this may be killed
    // before the second sleep (see README). For local runs it works.
    runLifecycle(activityId).catch((err) => {
      console.error(`[demo] ${activityId} failed`, err)
    })
    return
  }

  send(res, 404, { error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`My Delivery API http://127.0.0.1:${PORT}`)
  console.log(`Live Hive base ${liveHiveBase()}`)
  console.log(
    `POST /demo/start { "activity_id": "<uuid>" } → update +${DELAY_MS}ms, end +${DELAY_MS * 2}ms`,
  )
})
