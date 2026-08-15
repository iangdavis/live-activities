import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Live Activity APNs',
  description:
    'APNs settings for Live Activities: .p8 keys, topics, sandbox vs production, and common rejection reasons.',
  alternates: { canonical: '/guides/live-activity-apns' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">Live Activity APNs</h1>
      <p className="mt-4">
        Live Activities talk to Apple Push Notification service over HTTP/2.
        Authenticate with an ES256 JWT signed by your APNs .p8 key (Team ID +
        Key ID).
      </p>
      <p>Frequent failures:</p>
      <ul>
        <li>
          <code>BadDeviceToken</code> — sandbox token sent to production (or the reverse)
        </li>
        <li>
          <code>DeviceTokenNotForTopic</code> — bundle ID / topic mismatch
        </li>
        <li>
          <code>ExpiredProviderToken</code> — JWT older than an hour or wrong key
        </li>
        <li>
          <code>InvalidProviderToken</code> — Team ID or Key ID does not match the .p8
        </li>
      </ul>
      <p>
        Live Hive stores the key encrypted and records the APNs status on every
        delivery. Configuration steps:{' '}
        <Link href="/docs/apns">APNs documentation</Link>.
      </p>
    </>
  )
}
