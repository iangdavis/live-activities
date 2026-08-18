import { demoStepMs, keyConfigured, liveHiveBase } from '../lib/lifecycle.mjs'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }
  res.status(200).json({
    ok: true,
    base: liveHiveBase(),
    delay_ms: demoStepMs(),
    key_configured: keyConfigured(),
  })
}
