import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Live Activity backend',
  description:
    'What a Live Activity backend actually has to do: store push tokens, talk to APNs with the liveactivity push type, and record delivery.',
  alternates: { canonical: '/guides/live-activity-backend' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">Live Activity backend</h1>
      <p className="mt-4">
        A Live Activity backend is the server that updates an ActivityKit Live
        Activity after the iPhone is locked or the app is suspended. Local
        timers and in-app refreshes are not enough once the process is gone.
      </p>
      <p>
        The server must sign APNs requests with a .p8 key, set{' '}
        <code>apns-push-type: liveactivity</code>, and send a JSON payload
        whose <code>content-state</code> matches the widget&rsquo;s{' '}
        <code>Codable</code> state. Live Hive holds the push token so your
        backend never sees it.
      </p>
      <p>
        That is the entire job. Live Hive is that backend as an HTTP API:{' '}
        <Link href="/docs/activities/register">register</Link>,{' '}
        <Link href="/docs/activities/update">update</Link>,{' '}
        <Link href="/docs/activities/end">end</Link>. The iOS app registers the
        token. You keep order logic, ETAs, and auth in your own service. Any
        backend language works — HTTP only. See{' '}
        <Link href="/docs/getting-started">Getting started</Link> or{' '}
        <Link href="/llms.txt">/llms.txt</Link>.
      </p>
      <p>
        Related: <Link href="/guides/activitykit-server">ActivityKit server</Link>
        , <Link href="/guides/live-activity-apns">Live Activity APNs</Link>.
      </p>
    </>
  )
}
