import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ActivityKit push notifications',
  description:
    'ActivityKit Live Activities use a dedicated APNs push type, not a regular alert. Here is what the request must include.',
  alternates: { canonical: '/guides/activitykit-push-notifications' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">ActivityKit push notifications</h1>
      <p className="mt-4">
        Live Activity updates are APNs pushes, but they are not the same as
        alert notifications. Apple requires:
      </p>
      <ul>
        <li>
          Header <code>apns-push-type: liveactivity</code>
        </li>
        <li>
          Topic <code>{'{bundleId}.push-type.liveactivity'}</code>
        </li>
        <li>
          Body with <code>aps.event</code> of <code>update</code> or{' '}
          <code>end</code>, plus <code>aps.content-state</code>
        </li>
        <li>A device token issued for that Live Activity, not the app&rsquo;s generic push token</li>
      </ul>
      <p>
        FCM and generic &ldquo;send notification&rdquo; SDKs often cannot set
        this push type. If you try, Apple rejects the request. See{' '}
        <Link href="/guides/live-activity-push-token">Live Activity push tokens</Link>{' '}
        and the <Link href="/docs/apns">APNs docs</Link>.
      </p>
    </>
  )
}
