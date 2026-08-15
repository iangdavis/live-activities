import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Update a Live Activity',
  description:
    'Send a Live Activity content-state update through Live Hive. We authenticate, queue, and deliver via APNs.',
  alternates: { canonical: '/docs/activities/update' },
}

export default function UpdateDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Update</h1>
      <p className="mt-4">
        <code>content_state</code> must match the <code>ContentState</code> your
        widget extension decodes. Live Hive does not transform it.
      </p>
      <pre>
        <code>{`POST /api/v1/activities/customer-activity-123/update

{
  "content_state": {
    "status": "driver_arriving",
    "eta": 4
  }
}`}</code>
      </pre>
      <p>Response:</p>
      <pre>
        <code>{`{
  "id": "upd_...",
  "activity_id": "customer-activity-123",
  "status": "sent"
}`}</code>
      </pre>
      <p>
        <code>status</code> is <code>sent</code> or <code>failed</code> after
        Live Hive talks to APNs. Failed deliveries include the Apple reason in
        the dashboard. Live Hive does not report success unless APNs accepted
        the push.
      </p>
    </>
  )
}
