import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Activities',
  description:
    'Create, update, and end iOS Live Activities through the Live Hive HTTP API.',
  alternates: { canonical: '/docs/activities' },
}

export default function ActivitiesDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Activities</h1>
      <p className="mt-4">
        You own the activity ID. Live Hive stores an internal record, the push
        token, and every delivery attempt.
      </p>
      <ul>
        <li>
          <Link href="/docs/activities/register">POST /v1/activities</Link> —
          create (send the push token)
        </li>
        <li>
          <Link href="/docs/activities/update">POST /v1/activities/:id/update</Link>{' '}
          — send a content-state update
        </li>
        <li>
          <Link href="/docs/activities/end">POST /v1/activities/:id/end</Link> —
          end the Live Activity
        </li>
      </ul>
      <p>
        <code>activity_id</code> in the API is your ID (for example an order
        ID). It is unique per project. Creating the same ID again updates the
        push token instead of inserting a duplicate.
      </p>
    </>
  )
}
