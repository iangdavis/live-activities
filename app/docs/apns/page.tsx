import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'APNs configuration',
  description:
    'Configure Apple Team ID, Key ID, APNs .p8 private key, and bundle ID so Live Hive can send Live Activity pushes.',
  alternates: { canonical: '/docs/apns' },
}

export default function ApnsDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">APNs</h1>
      <p className="mt-4">
        Live Hive sends Live Activity remote notifications with token-based
        APNs authentication (a .p8 key). You provide Apple credentials per
        project. They are encrypted at rest and never shown again in the
        dashboard.
      </p>
      <h2>What to create in Apple Developer</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>An App ID with Push Notifications and Live Activities enabled.</li>
        <li>
          A Key with Apple Push Notifications service (APNs) enabled. Download
          the <code>.p8</code> file once.
        </li>
        <li>Note the Team ID, Key ID, and your app&rsquo;s Bundle ID.</li>
      </ol>
      <h2>What to paste into Live Hive</h2>
      <ul>
        <li>Apple Team ID</li>
        <li>Key ID</li>
        <li>APNs private key (.p8 contents)</li>
        <li>Bundle ID</li>
        <li>Environment: sandbox for development builds, production for TestFlight/App Store</li>
      </ul>
      <p>
        Live Hive sets <code>apns-push-type</code> to <code>liveactivity</code>{' '}
        and <code>apns-topic</code> to{' '}
        <code>{'{bundleId}.push-type.liveactivity'}</code>.
      </p>
      <p>
        Development devices need the sandbox environment. TestFlight and App
        Store builds need production. Mixing them is the most common reason a
        push token looks valid but APNs returns <code>BadDeviceToken</code>.
      </p>
      <p>
        More background:{' '}
        <Link href="/guides/live-activity-apns">Live Activity APNs guide</Link>.
      </p>
    </>
  )
}
