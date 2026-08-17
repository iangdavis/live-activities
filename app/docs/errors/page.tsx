import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Errors',
  description: 'Live Hive API error codes for authentication, validation, and APNs delivery.',
  alternates: { canonical: '/docs/errors' },
}

export default function ErrorsDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Errors</h1>
      <p className="mt-4">
        Errors are JSON. HTTP status matches the code class.
      </p>
      <pre>
        <code>{`{
  "error": {
    "code": "invalid_api_key",
    "message": "API key is invalid or revoked."
  }
}`}</code>
      </pre>
      <ul>
        <li>
          <code>400</code> <code>invalid_json</code> / <code>invalid_request</code>{' '}
          / <code>apns_not_configured</code> — bad JSON, failed validation, or
          missing Apple credentials
        </li>
        <li>
          <code>401</code> <code>unauthorized</code> / <code>invalid_api_key</code>{' '}
          — missing, wrong, or revoked Bearer token
        </li>
        <li>
          <code>403</code> <code>forbidden</code> / <code>plan_limit</code> — a
          public iOS key was used for a server-only operation, or a free-tier
          cap was hit
        </li>
        <li>
          <code>404</code> <code>activity_not_found</code> — that activity ID is
          not in this project
        </li>
        <li>
          <code>409</code> <code>activity_ended</code> — updates are rejected
          after end
        </li>
        <li>
          <code>429</code> <code>rate_limited</code> — slow down
        </li>
        <li>
          <code>500</code> <code>internal_error</code>
        </li>
      </ul>
      <p>
        Delivery failures after a valid request still return HTTP 200 with a
        delivery object <code>status: &quot;failed&quot;</code>. Check the
        dashboard for the APNs reason (<code>BadDeviceToken</code>,{' '}
        <code>ExpiredProviderToken</code>, and so on). Live Hive does not invent
        a successful delivery. Machine copy:{' '}
        <Link href="/llms.txt">/llms.txt</Link>.
      </p>
    </>
  )
}
