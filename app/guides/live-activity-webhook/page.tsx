import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Live Activity webhook',
  description:
    'Live Activities do not use incoming webhooks from Apple. Your backend pushes to APNs. Here is the difference.',
  alternates: { canonical: '/guides/live-activity-webhook' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">Live Activity webhook</h1>
      <p className="mt-4">
        People search for a &ldquo;Live Activity webhook&rdquo; expecting Apple
        to call their server when a Live Activity changes. That is not how
        ActivityKit works.
      </p>
      <p>
        Apple does not POST activity events to you. Your server pushes to APNs.
        The iPhone is the subscriber. If you need your own systems to react
        (for example a courier GPS service), that webhook is between your
        services — then you call APNs (or Live Hive) to update the device.
      </p>
      <p>
        Live Hive is an HTTP API you call, not a webhook you expose. See{' '}
        <Link href="/docs/getting-started">getting started</Link>.
      </p>
    </>
  )
}
