import { demoApiKey, demoStepMs } from '@/lib/demo-delivery'

export async function GET() {
  return Response.json({
    ok: true,
    key_configured: Boolean(demoApiKey()?.startsWith('lh_live_')),
    delay_ms: demoStepMs(),
  })
}
