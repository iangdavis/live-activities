import type { Metadata } from 'next'
import { BackendSnippet } from '@/components/docs/BackendSnippet'

export const metadata: Metadata = {
  title: 'End a Live Activity',
  description: 'Terminate an iOS Live Activity through the Live Hive API.',
  alternates: { canonical: '/docs/activities/end' },
}

export default function EndDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">End</h1>
      <p className="mt-4">
        Send an end event when the Live Activity should dismiss. This route
        requires a server API key (<code>lh_live_...</code>).
      </p>
      <pre>
        <code>{`POST /v1/activities/customer-activity-123/end

{
  "content_state": {
    "status": "delivered",
    "eta": 0
  }
}`}</code>
      </pre>
      <p>
        POST JSON to <code>https://api.livehive.dev/v1</code> with a secret key.
        Example snippets (any language works):
      </p>
      <BackendSnippet example="end" />
      <p>
        The body may be empty. If APNs accepts the end event, the activity is
        marked ended and the dashboard records <code>ended_at</code> plus the
        APNs result.
      </p>
    </>
  )
}
