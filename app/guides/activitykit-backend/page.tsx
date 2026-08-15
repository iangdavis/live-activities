import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ActivityKit backend',
  description:
    'What to put behind ActivityKit: token store, APNs liveactivity pushes, and delivery logs.',
  alternates: { canonical: '/guides/activitykit-backend' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">ActivityKit backend</h1>
      <p className="mt-4">
        An ActivityKit backend is the same problem as a{' '}
        <Link href="/guides/live-activity-backend">Live Activity backend</Link>:
        persist tokens, send <code>liveactivity</code> pushes, end activities,
        and make failures visible.
      </p>
      <p>
        The iOS side stays in your repo (widget extension, attributes, UI). The
        server side is what teams usually underestimate — HTTP/2, JWT rotation,
        sandbox vs production, and Apple&rsquo;s update budget.
      </p>
      <p>
        Live Hive is an ActivityKit backend you do not operate:{' '}
        <Link href="/docs">API documentation</Link>.
      </p>
    </>
  )
}
