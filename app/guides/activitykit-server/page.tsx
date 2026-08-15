import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ActivityKit server',
  description:
    'How to run a server for ActivityKit Live Activities: token registration, APNs HTTP/2, and ending the activity.',
  alternates: { canonical: '/guides/activitykit-server' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">ActivityKit server</h1>
      <p className="mt-4">
        ActivityKit is the on-device framework. The server is whatever receives
        the push token and later asks Apple to update the Lock Screen.
      </p>
      <p>Minimum server responsibilities:</p>
      <ul>
        <li>Accept a token from your iOS app (usually via your own API).</li>
        <li>Associate it with a business ID (order, game, ride).</li>
        <li>
          POST to APNs when that business object changes, using the Live
          Activity topic.
        </li>
        <li>Send an end event so the activity does not sit on the Lock Screen forever.</li>
      </ul>
      <p>
        You can build this with Node http2, a worker, and Postgres. Live Hive
        is the same shape, hosted:{' '}
        <Link href="/docs/getting-started">getting started</Link>.
      </p>
    </>
  )
}
