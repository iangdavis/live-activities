import type { Metadata } from 'next'
import Link from 'next/link'
import { BackendSnippet } from '@/components/docs/BackendSnippet'
import { CANONICAL_API_BASE } from '@/lib/api-contract'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Register an iOS Live Activity with the Live Hive SDK, then update and end it over HTTP. No token-registration server required.',
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
        iOS SDK on the device. HTTP from your backend, any language. There is no
        server SDK. Machine-readable contract:{' '}
        <Link href="/llms.txt">/llms.txt</Link> and{' '}
        <Link href="/openapi.json">/openapi.json</Link>.
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
          Add the Live Hive iOS SDK from <code>sdks/ios</code>. Call{' '}
          <code>Activity.request(..., pushType: .token)</code>, then{' '}
          <code>LiveHive.configure</code> and <code>LiveHive.register(activity)</code>.
        </li>
        <li>
          Copy the <strong>Server API Key</strong> (<code>lh_live_...</code>).
          Keep it secret. Never put it in the app.
        </li>
        <li>
          From your backend, POST{' '}
          <code>{CANONICAL_API_BASE}/activities/:id/update</code>. When it is
          done, POST <code>.../end</code>.
        </li>
      </ol>
      <p>
        You still need ActivityKit, a WidgetKit extension, and{' '}
        <code>NSSupportsLiveActivities</code>. The SDK observes{' '}
        <code>pushTokenUpdates</code> and registers the hex token. Your backend
        never sees it.
      </p>

      <h2>Do not</h2>
      <ul>
        <li>Put <code>lh_live_</code> in the iOS app or widget.</li>
        <li>Build a token-forwarding or token-registration server.</li>
        <li>Look for a server SDK. Backend is HTTP.</li>
        <li>
          Skip <code>pushType: .token</code>, WidgetKit, or matching{' '}
          <code>content_state</code> to <code>ContentState</code>.
        </li>
        <li>Use the public key for update or end.</li>
      </ul>

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
        POST JSON to <code>{CANONICAL_API_BASE}</code> with{' '}
        <code>lh_live_</code>. The <code>content_state</code> object must match
        the widget <code>ContentState</code>. Raw HTTP examples (any language
        works):
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
