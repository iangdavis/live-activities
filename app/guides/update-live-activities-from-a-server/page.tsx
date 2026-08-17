import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to update Live Activities from a server',
  description:
    'Step-by-step: start an ActivityKit Live Activity, send the push token to a server, and update content-state through APNs.',
  alternates: { canonical: '/guides/update-live-activities-from-a-server' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">How to update Live Activities from a server</h1>
      <ol className="mt-4 list-decimal space-y-3 pl-5">
        <li>
          Define <code>ActivityAttributes</code> and a <code>ContentState</code>{' '}
          that your Lock Screen UI can render.
        </li>
        <li>
          Start the activity on device with <code>Activity.request</code>.
        </li>
        <li>
          Read the Live Activity push token and register it with Live Hive
          (the iOS SDK does this; no token-forwarding server is required).
        </li>
        <li>
          When your domain state changes, your backend POSTs a Live Hive
          update whose <code>content_state</code> matches that struct.
        </li>
        <li>When the job is done, send an end event.</li>
      </ol>
      <p>
        With Live Hive, token registration is{' '}
        <Link href="/docs/activities/register">register</Link> and steps 4–5 are{' '}
        <Link href="/docs/activities/update">update</Link> and{' '}
        <Link href="/docs/activities/end">end</Link>. You still own ActivityKit
        and WidgetKit setup in the iOS app. Machine-readable:{' '}
        <Link href="/llms.txt">/llms.txt</Link>,{' '}
        <Link href="/openapi.json">/openapi.json</Link>.
      </p>
    </>
  )
}
