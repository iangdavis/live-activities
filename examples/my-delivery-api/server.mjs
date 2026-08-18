#!/usr/bin/env node
/**
 * My Delivery API — server-driven Live Hive demo.
 * POST /demo/start { activity_id } → 202, then update at T+10s, end at T+20s.
 * Secret key stays here. The iOS SDK does not update or end.
 */
import http from 'node:http'

const PORT = Number(process.env.PORT || 8787)
const KEY = process.env.LIVEHIVE_API_KEY || ''
const BASE = (process.env.LIVEHIVE_API_BASE || 'https://www.livehive.dev/v1').replace(
  /\/$/,
  ''
)
const DELAY_MS = Number(process.env.DEMO_STEP_MS || 10_000)

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

async function livehive(activityId, action, contentState) {
  const url = `${BASE}/activities/${encodeURIComponent(activityId)}/${action}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content_state: contentState }),
    redirect: 'error',
  })
  const text = await res.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = { raw: text }
  }
  console.log(`[livehive] ${action} ${res.status}`, parsed)
  return parsed
}

async function runLifecycle(activityId) {
  console.log(`[demo] ${activityId} update in ${DELAY_MS}ms`)
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  await livehive(activityId, 'update', { status: 'driver_arriving', eta: 4 })
  console.log(`[demo] ${activityId} end in ${DELAY_MS}ms`)
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  await livehive(activityId, 'end', { status: 'delivered', eta: 0 })
  console.log(`[demo] ${activityId} done`)
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
      base: BASE,
      delay_ms: DELAY_MS,
      key_configured: KEY.startsWith('lh_live_'),
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/demo/start') {
    if (!KEY.startsWith('lh_live_')) {
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
    runLifecycle(activityId).catch((err) => {
      console.error(`[demo] ${activityId} failed`, err)
    })
    return
  }

  send(res, 404, { error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`My Delivery API http://127.0.0.1:${PORT}`)
  console.log(`Live Hive base ${BASE}`)
  console.log(`POST /demo/start { "activity_id": "<uuid>" } → update +${DELAY_MS}ms, end +${DELAY_MS * 2}ms`)
})
