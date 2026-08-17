import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Activities',
  description:
    'Register iOS Live Activities from the app, then update and end them through the Live Hive HTTP API.',
  alternates: { canonical: '/docs/activities' },
}

export default function ActivitiesDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Activities</h1>
      <p className="mt-4">
        You own the activity ID. Live Hive stores an internal record, the push
        token, and every delivery attempt. The iOS app registers the token; your
        backend updates and ends over HTTP in any language. Example snippets
        (not a supported-language list) are on the update and end pages.
      </p>
      <ul>
        <li>
          <Link href="/docs/activities/register">POST /v1/activities/register</Link>{' '}
          — register a push token (iOS public key)
        </li>
        <li>
          <Link href="/docs/activities/update">POST /v1/activities/:id/update</Link>{' '}
          — send a content-state update (server API key)
        </li>
        <li>
          <Link href="/docs/activities/end">POST /v1/activities/:id/end</Link> —
          end the Live Activity (server API key)
        </li>
      </ul>
      <p>
        <code>activity_id</code> is your ID (for example{' '}
        <code>Activity.id</code> from ActivityKit, or an order ID). It is unique
        per project. Registering the same ID again updates the push token
        instead of inserting a duplicate.
      </p>
    </>
  )
}
