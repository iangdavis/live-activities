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
          Read the Live Activity push token and POST it to your backend with a
          stable ID.
        </li>
        <li>
          When your domain state changes, your backend sends an APNs Live
          Activity update whose <code>content-state</code> matches that struct.
        </li>
        <li>When the job is done, send an end event.</li>
      </ol>
      <p>
        With Live Hive, steps 4–5 are{' '}
        <Link href="/docs/activities/update">update</Link> and{' '}
        <Link href="/docs/activities/end">end</Link>. You still own steps 1–3 in
        the iOS app.
      </p>
    </>
  )
}
