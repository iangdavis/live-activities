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
        ActivityKit is the on-device framework. If you use Live Hive, the iOS
        SDK registers the push token; your backend only POSTs updates and end
        events over HTTP.
      </p>
      <p>Minimum server responsibilities:</p>
      <ul>
        <li>The iOS SDK registers the push token with Live Hive. Do not build your own token API.</li>
        <li>Associate a business ID (order, game, ride) with the activity.</li>
        <li>
          POST an update to Live Hive (or APNs) when that business object changes.
        </li>
        <li>POST an end event so the activity does not sit on the Lock Screen forever.</li>
      </ul>
      <p>
        You can still build APNs yourself with Node http2, a worker, and
        Postgres. With Live Hive, skip that: the iOS SDK registers the token
        and your backend POSTs HTTP.{' '}
        <Link href="/docs/getting-started">getting started</Link>.
      </p>
    </>
  )
}
