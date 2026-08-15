import type { Metadata } from 'next'

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
        Send an end event when the Live Activity should dismiss.
      </p>
      <pre>
        <code>{`POST /api/v1/activities/customer-activity-123/end

{
  "content_state": {
    "status": "delivered",
    "eta": 0
  }
}`}</code>
      </pre>
      <p>
        The body may be empty. If APNs accepts the end event, the activity is
        marked ended and the dashboard records <code>ended_at</code> plus the
        APNs result.
      </p>
    </>
  )
}
