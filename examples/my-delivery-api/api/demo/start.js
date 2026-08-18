import { waitUntil } from '@vercel/functions'
import { keyConfigured, runLifecycle } from '../../lib/lifecycle.mjs'

export const config = { maxDuration: 60 }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' })
    return
  }

  if (!keyConfigured()) {
    res.status(500).json({
      error: 'Set LIVEHIVE_API_KEY on this Vercel project to a lh_live_ server key',
    })
    return
  }

  let body = {}
  try {
    const raw = req.body
    body = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw || {}
  } catch {
    res.status(400).json({ error: 'invalid json' })
    return
  }
  const activityId = String(body.activity_id || '').trim()
  if (!activityId) {
    res.status(400).json({ error: 'activity_id required' })
    return
  }

  waitUntil(
    runLifecycle(activityId).catch((err) => {
      console.error(`[demo] ${activityId} failed`, err)
    }),
  )

  res.status(202).json({ ok: true, activity_id: activityId })
}
