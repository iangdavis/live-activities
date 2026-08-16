import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Register a Live Activity',
  description:
    'Register an ActivityKit push token with Live Hive from the iOS app using a public key. No token-registration server required.',
  alternates: { canonical: '/docs/activities/register' },
}

export default function RegisterDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Register</h1>
      <p className="mt-4">
        The iOS app starts the Live Activity and registers the push token
        directly with Live Hive. Your backend does not need a token-forwarding
        endpoint. Tokens rotate; the iOS SDK calls this again whenever
        ActivityKit issues a new one.
      </p>
      <pre>
        <code>{`POST /v1/activities/register
Authorization: Bearer lh_pub_...

{
  "activity_id": "customer-activity-123",
  "push_token": "...",
  "type": "delivery"
}`}</code>
      </pre>
      <p>
        <code>type</code> and <code>expires_at</code> are optional. Same{' '}
        <code>project + activity_id</code> replaces the stored token instead of
        inserting a duplicate. The response includes the activity ID and basic
        metadata. It never includes the push token or APNs credentials.
      </p>
      <p>
        Prefer the iOS SDK, which does this for you:
      </p>
      <pre>
        <code>{`LiveHive.configure(publicKey: "lh_pub_...")
LiveHive.register(activity)`}</code>
      </pre>
      <p>
        A secret <code>lh_live_</code> key can still create activities at{' '}
        <code>POST /v1/activities</code> for older backends. Public keys cannot
        call that route, and they cannot update or end activities. See{' '}
        <Link href="/docs/ios">iOS SDK</Link>.
      </p>
    </>
  )
}
