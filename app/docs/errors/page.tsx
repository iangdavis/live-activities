import type { Metadata } from 'next'

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
          <code>unauthorized</code> / <code>invalid_api_key</code> — missing or
          wrong Bearer token
        </li>
        <li>
          <code>invalid_request</code> — JSON or field validation failed
        </li>
        <li>
          <code>activity_not_found</code> — that activity ID is not in this
          project
        </li>
        <li>
          <code>activity_ended</code> — updates are rejected after end
        </li>
        <li>
          <code>apns_not_configured</code> — add Apple credentials first
        </li>
        <li>
          <code>plan_limit</code> — free-tier project or monthly update cap
        </li>
        <li>
          <code>rate_limited</code> — slow down
        </li>
      </ul>
      <p>
        Delivery failures after a valid request still return a delivery object
        with <code>status: "failed"</code>. Check the dashboard for the APNs
        reason (<code>BadDeviceToken</code>, <code>ExpiredProviderToken</code>,
        and so on). Live Hive does not invent a successful delivery.
      </p>
    </>
  )
}
