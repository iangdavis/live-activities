import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Create a Live Hive project, get an API key, register an iOS Live Activity push token, and send updates through APNs.',
  alternates: { canonical: '/docs/getting-started' },
}

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-[32px]">Getting started</h1>
      <p className="mt-4">
        A competent iOS developer should be able to send a real Live Activity
        update through Live Hive in a few minutes.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5">
        <li>
          <Link href="/signup">Create a Live Hive account</Link> and a project.
        </li>
        <li>
          Create an API key. Copy it once. It starts with <code>lh_live_</code>.
        </li>
        <li>
          Add your Apple APNs credentials on the project page. See{' '}
          <Link href="/docs/apns">APNs setup</Link>.
        </li>
        <li>
          In your iOS app, start a Live Activity with ActivityKit and read its
          push token.
        </li>
        <li>Send that token from your backend to Live Hive.</li>
        <li>POST updates (and later, an end event) to the Live Hive API.</li>
      </ol>

      <h2>1. Register the activity</h2>
      <pre>
        <code>{`curl -X POST https://livehive.dev/api/v1/activities \\
  -H "Authorization: Bearer lh_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "activity_id": "abc123",
    "push_token": "..."
  }'`}</code>
      </pre>

      <h2>2. Send an update</h2>
      <pre>
        <code>{`curl -X POST https://livehive.dev/api/v1/activities/abc123/update \\
  -H "Authorization: Bearer lh_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content_state": {
      "status": "driver_arriving",
      "eta": 4
    }
  }'`}</code>
      </pre>

      <h2>3. Confirm delivery</h2>
      <p>
        Open the dashboard. The activity should appear with a last delivery
        result. If APNs rejected the push, the error reason is on the activity
        page.
      </p>
      <p>
        Then <Link href="/docs/activities/end">end the activity</Link> when it is
        done.
      </p>
    </>
  )
}
