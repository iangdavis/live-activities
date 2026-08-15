import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register a Live Activity',
  description:
    'Register an ActivityKit push token with Live Hive so the server can update that Live Activity.',
  alternates: { canonical: '/docs/activities/register' },
}

export default function RegisterDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Register</h1>
      <p className="mt-4">
        After ActivityKit gives you a push-to-start or update token, send it to
        your backend, then register it with Live Hive.
      </p>
      <pre>
        <code>{`POST /api/v1/activities

{
  "activity_id": "customer-activity-123",
  "push_token": "...",
  "type": "delivery"
}`}</code>
      </pre>
      <p>
        <code>type</code> is optional. Registration is idempotent for{' '}
        <code>project + activity_id</code>: a second call updates the token.
      </p>
      <p>
        In Swift, observe <code>Activity.pushTokenUpdates</code> or the
        push-to-start token and POST the hex string to your server. Do not send
        the token from the device directly to Live Hive unless you are
        comfortable shipping your secret key in the app — keep the secret on
        your backend.
      </p>
    </>
  )
}
