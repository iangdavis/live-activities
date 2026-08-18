import { afterEach, describe, expect, it } from 'vitest'
import { demoApiKey, demoStepMs } from '@/lib/demo-delivery'

describe('demo delivery config', () => {
  afterEach(() => {
    delete process.env.LIVEHIVE_DEMO_STEP_MS
    delete process.env.LIVEHIVE_DEMO_API_KEY
  })

  it('defaults the step delay to 10 seconds', () => {
    expect(demoStepMs()).toBe(10_000)
  })

  it('reads LIVEHIVE_DEMO_STEP_MS', () => {
    process.env.LIVEHIVE_DEMO_STEP_MS = '3000'
    expect(demoStepMs()).toBe(3000)
  })

  it('treats a lh_live_ env value as configured', () => {
    process.env.LIVEHIVE_DEMO_API_KEY = 'lh_live_xxxxxxxxxxxxxxxxxxxx'
    expect(demoApiKey()?.startsWith('lh_live_')).toBe(true)
  })
})
