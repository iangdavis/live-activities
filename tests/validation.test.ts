import { describe, expect, it } from 'vitest'
import { endActivitySchema, registerActivitySchema, updateActivitySchema } from '@/lib/api-auth'

describe('request validation', () => {
  it('accepts a registration payload', () => {
    const parsed = registerActivitySchema.safeParse({
      activity_id: 'customer-activity-123',
      push_token: 'a'.repeat(64),
      type: 'delivery',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects empty activity ids', () => {
    const parsed = registerActivitySchema.safeParse({
      activity_id: '',
      push_token: 'a'.repeat(64),
    })
    expect(parsed.success).toBe(false)
  })

  it('requires content_state on update', () => {
    expect(updateActivitySchema.safeParse({}).success).toBe(false)
    expect(
      updateActivitySchema.safeParse({
        content_state: { status: 'driver_arriving', eta: 4 },
      }).success,
    ).toBe(true)
  })

  it('allows an empty end body', () => {
    expect(endActivitySchema.safeParse({}).success).toBe(true)
  })
})
