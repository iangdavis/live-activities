import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication',
  description:
    'Authenticate iOS registration with a public key and backend update/end calls with a secret Live Hive API key.',
  alternates: { canonical: '/docs/authentication' },
}

export default function AuthDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Authentication</h1>
      <p className="mt-4">
        Live Hive issues two project keys. They are not interchangeable.
      </p>

      <h2>iOS Public Key</h2>
      <pre>
        <code>Authorization: Bearer lh_pub_...</code>
      </pre>
      <p>
        Safe to include in your iOS app. It can only call{' '}
        <Link href="/docs/activities/register">POST /v1/activities/register</Link>.
        It cannot update, end, or read activities, and it cannot access APNs
        configuration.
      </p>

      <h2>Server API Key</h2>
      <pre>
        <code>Authorization: Bearer lh_live_...</code>
      </pre>
      <p>
        Keep this secret. Never put it in your iOS app. There is no server SDK.
        POST update and end from your backend over HTTP, any language. Keys are
        hashed at rest. Live Hive shows the full secret key only when it is
        created. If you lose it, revoke it and create another.
      </p>

      <h2>Where to get a key</h2>
      <p>
        Open the project. Create an iOS public key for the app and a server API
        key for your backend. Each key is scoped to that project. A public key
        cannot register into a different project.
      </p>

      <h2>Treat public keys as extractable</h2>
      <p>
        An iOS public key can be pulled out of the app binary. That is expected.
        It still cannot update, end, or read activities. It can only register
        tokens for its own project. Prefer unguessable activity IDs so a leaked
        public key cannot overwrite another device&rsquo;s token by guessing
        <code>activity_id</code>. Revoke and rotate the public key if it is
        abused.
      </p>

      <h2>Base URL</h2>
      <p>
        Canonical host: <code>https://www.livehive.dev/v1</code>. Use that in
        new code. <code>https://www.livehive.dev/api/v1</code> is the same API.
      </p>
    </>
  )
}
