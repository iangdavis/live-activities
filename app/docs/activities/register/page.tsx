import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a Live Activity',
  description:
    'Create a Live Hive activity from an ActivityKit push token so you can update and end it later.',
  alternates: { canonical: '/docs/activities/register' },
}

export default function RegisterDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Create</h1>
      <p className="mt-4">
        The iOS app starts the Live Activity. Your backend then creates it in
        Live Hive by sending the push token. This is not a one-time setup:
        tokens rotate, so call it again whenever ActivityKit gives you a new
        one.
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
        <code>type</code> is optional. Same <code>project + activity_id</code>{' '}
        replaces the stored token instead of inserting a duplicate.
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
