/** Shared Live Hive HTTP lifecycle for local Node and Vercel. */

export function liveHiveBase() {
  // For demo runs, use the canonical Live Hive public API so iOS-registered
  // activities (which use the public SDK host) are visible to our demo server.
  // Allow override via LIVEHIVE_API_BASE if needed.
  return (process.env.LIVEHIVE_API_BASE || 'https://www.livehive.dev/v1').replace(/\/$/, '')
}

export function liveHiveKey() {
  return (process.env.LIVEHIVE_API_KEY || '').trim()
}

export function demoStepMs() {
  // Default to 3000ms for demos so serverless platforms (Vercel Hobby) can
  // complete both update+end within short-lived function limits. Override with
  // DEMO_STEP_MS or LIVEHIVE_DEMO_STEP_MS if you need a different timing.
  const raw = Number(process.env.DEMO_STEP_MS || process.env.LIVEHIVE_DEMO_STEP_MS || 3_000)
  if (!Number.isFinite(raw) || raw < 0) return 3_000
  return raw
}

export function keyConfigured() {
  return liveHiveKey().startsWith('lh_live_')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function livehive(activityId, action, contentState) {
  const url = `${liveHiveBase()}/activities/${encodeURIComponent(activityId)}/${action}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${liveHiveKey()}`,
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

export async function runLifecycle(activityId) {
  const delay = demoStepMs()
  console.log(`[demo] ${activityId} update in ${delay}ms`)
  await sleep(delay)
  await livehive(activityId, 'update', { status: 'driver_arriving', eta: 4 })
  console.log(`[demo] ${activityId} end in ${delay}ms`)
  await sleep(delay)
  await livehive(activityId, 'end', { status: 'delivered', eta: 0 })
  console.log(`[demo] ${activityId} done`)
}
