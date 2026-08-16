import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Live Activity push token',
  description:
    'How ActivityKit push tokens work, where to read them in Swift, and how to send them to a backend.',
  alternates: { canonical: '/guides/live-activity-push-token' },
}

export default function Page() {
  return (
    <>
      <h1 className="text-[32px]">Live Activity push token</h1>
      <p className="mt-4">
        A Live Activity push token is a per-activity APNs token. It is not the
        token you get from <code>didRegisterForRemoteNotifications</code>.
      </p>
      <p>
        After you request a Live Activity, observe{' '}
        <code>activity.pushTokenUpdates</code>. The value is <code>Data</code>;
        send it to Live Hive as lowercase hex (the iOS SDK does this). Tokens can rotate. If you
        create the same <code>activity_id</code> again, Live Hive replaces
        the stored token. Your backend does not need to receive the token.
      </p>
      <p>
        Push-to-start tokens are separate: they let you start an activity when
        the app is not running. Store whichever token your product actually
        uses, and keep sandbox vs production straight.
      </p>
      <p>
        Create in Live Hive:{' '}
        <Link href="/docs/activities/register">POST /v1/activities/register</Link>
        , or call <Link href="/docs/ios">LiveHive.register(activity)</Link>.
      </p>
    </>
  )
}
