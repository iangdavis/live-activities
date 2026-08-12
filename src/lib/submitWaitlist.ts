import { config } from '../config'

export type SubmitResult = { ok: true } | { ok: false; error: string }

/**
 * Submits an email to the waitlist.
 *
 * When `config.waitlistEndpoint` is set, this POSTs the email as JSON to that
 * URL. Otherwise it falls back to a local mock that simulates a network
 * request so the success state can be demonstrated without a backend.
 *
 * To connect a real backend later, set `waitlistEndpoint` in `src/config.ts`
 * (or replace the mock branch below with your provider's SDK call).
 */
export async function submitWaitlist(email: string): Promise<SubmitResult> {
  const trimmed = email.trim()

  if (!isValidEmail(trimmed)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }

  if (config.waitlistEndpoint) {
    try {
      const res = await fetch(config.waitlistEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) {
        return { ok: false, error: 'Something went wrong. Please try again.' }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error. Please try again.' }
    }
  }

  // Mock submission: pretend to reach a server.
  await new Promise((resolve) => setTimeout(resolve, 650))
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[waitlist] mock submission:', trimmed)
  }
  return { ok: true }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
