import type { Metadata } from 'next'
import Link from 'next/link'
import { BackendSnippet } from '@/components/docs/BackendSnippet'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Register an iOS Live Activity with the Live Hive SDK, then update and end it from your backend. No token-registration server required.',
  alternates: { canonical: '/docs/getting-started' },
}

const SWIFT = `import ActivityKit
import LiveHive

struct DeliveryAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var eta: Int
  }
}

LiveHive.configure(publicKey: "lh_pub_...")

func startDelivery() async throws {
  let activity = try Activity.request(
    attributes: DeliveryAttributes(),
    content: .init(
      state: .init(status: "preparing", eta: 12),
      staleDate: nil
    ),
    pushType: .token
  )

  LiveHive.register(activity)
}`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-[32px]">Getting started</h1>
      <p className="mt-4">
        The iOS app starts the Live Activity and sends the push token directly
        to Live Hive. Your backend never sees the token. Do not put an{' '}
        <code>lh_live_</code> server key in the app.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5">
        <li>
          <Link href="/signup">Create a Live Hive account</Link> and a project.
        </li>
        <li>
          Configure Apple credentials on the project page. See{' '}
          <Link href="/docs/apns">APNs setup</Link>.
        </li>
        <li>
          Copy the <strong>iOS Public Key</strong> (<code>lh_pub_...</code>). It
          is safe to include in your iOS app.
        </li>
        <li>
          Add the Live Hive iOS SDK and call{' '}
          <code>LiveHive.configure</code> then <code>LiveHive.register(activity)</code>.
        </li>
        <li>
          Copy the <strong>Server API Key</strong> (<code>lh_live_...</code>).
          Keep it secret.
        </li>
        <li>From your backend, POST an update. When it is done, POST end.</li>
      </ol>
      <p>
        No token-registration server is required. The SDK observes{' '}
        <code>pushTokenUpdates</code>, converts the token to hex, and registers
        it with Live Hive. You still need ActivityKit, a WidgetKit extension,
        and <code>NSSupportsLiveActivities</code>.
      </p>

      <h2>1. Start and register the activity (iOS)</h2>
      <p>
        <code>content_state</code> later must match this{' '}
        <code>ContentState</code>. Use the public key only.
      </p>
      <pre>
        <code>{SWIFT}</code>
      </pre>
      <p>
        See <Link href="/docs/ios">iOS SDK</Link> for installation.
      </p>

      <h2>2. Update and end from your backend</h2>
      <p>
        Keep <code>lh_live_</code> in server env and POST JSON. The{' '}
        <code>content_state</code> object must match the widget{' '}
        <code>ContentState</code>. Examples in Node.js, Python, Go, and Ruby:
      </p>
      <BackendSnippet />
      <p>
        Same routes:{' '}
        <Link href="/docs/activities/register">register</Link>,{' '}
        <Link href="/docs/activities/update">update</Link>,{' '}
        <Link href="/docs/activities/end">end</Link>.
      </p>

      <h2>3. Confirm delivery</h2>
      <p>
        Open the app. The activity should appear with a last delivery
        result. If APNs rejected the push, the error reason is on the activity
        page.
      </p>
    </>
  )
}
