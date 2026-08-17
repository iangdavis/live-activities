import type { Metadata } from 'next'
import Link from 'next/link'
import { BackendSnippet } from '@/components/docs/BackendSnippet'
import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from '@/lib/api-contract'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Add the Live Hive iOS SDK with Swift Package Manager, register a Live Activity, then update and end it over HTTP.',
  alternates: { canonical: '/docs/getting-started' },
}

const SWIFT = `import ActivityKit
import LiveHive

// Put DeliveryAttributes in a file shared by the app and the widget.
struct DeliveryAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var eta: Int
  }
}

LiveHive.configure(publicKey: "lh_pub_...")

func startDelivery() throws {
  let activity = try Activity.request(
    attributes: DeliveryAttributes(),
    content: .init(
      state: .init(status: "preparing", eta: 12),
      staleDate: nil
    ),
    pushType: .token
  )

  LiveHive.register(activity)
  print(activity.id) // this is the activity_id in the HTTP URL
}`

const WIDGET = `import ActivityKit
import SwiftUI
import WidgetKit

struct DeliveryLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: DeliveryAttributes.self) { context in
      HStack {
        Text(context.state.status)
        Spacer()
        Text("\\(context.state.eta) min")
      }
      .padding()
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.bottom) {
          Text(context.state.status)
        }
      } compactLeading: {
        Text("LH")
      } compactTrailing: {
        Text("\\(context.state.eta)m")
      } minimal: {
        Text("\\(context.state.eta)")
      }
    }
  }
}`

const PLIST = `<key>NSSupportsLiveActivities</key>
<true/>`

const CURL = `export LIVEHIVE_API_KEY='lh_live_...'
export ACTIVITY_ID='paste-activity.id-from-the-phone'

curl -sS -X POST "${CANONICAL_API_BASE}/activities/\${ACTIVITY_ID}/update" \\
  -H "Authorization: Bearer \${LIVEHIVE_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"content_state":{"status":"driver_arriving","eta":4}}'

curl -sS -X POST "${CANONICAL_API_BASE}/activities/\${ACTIVITY_ID}/end" \\
  -H "Authorization: Bearer \${LIVEHIVE_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"content_state":{"status":"delivered","eta":0}}'`

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
          On the project page, add Apple credentials. See{' '}
          <Link href="/docs/apns">APNs setup</Link>. Use{' '}
          <strong>sandbox</strong> for an Xcode-installed debug build,{' '}
          <strong>production</strong> for TestFlight or App Store. Mixing them
          is the usual <code>BadDeviceToken</code>.
        </li>
        <li>
          Copy the <strong>iOS Public Key</strong> (<code>lh_pub_...</code>). It
          is safe to include in your iOS app.
        </li>
        <li>
          Copy the <strong>Server API Key</strong> (<code>lh_live_...</code>).
          Keep it secret. Never put it in the app.
        </li>
        <li>Add the Swift package, start a Live Activity, then POST updates.</li>
      </ol>

      <h2>1. Add the iOS SDK</h2>
      <p>
        In Xcode: File → Add Package Dependencies. Paste:
      </p>
      <pre>
        <code>{IOS_SDK_PACKAGE_URL.replace(/\.git$/, '')}</code>
      </pre>
      <p>
        Choose version <code>{IOS_SDK_VERSION}</code> or later (Up to Next
        Major). Add the <code>LiveHive</code> library to your <strong>app</strong>{' '}
        target, not the widget.
      </p>
      <pre>
        <code>{`.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`}</code>
      </pre>
      <p>
        Details: <Link href="/docs/ios">iOS SDK</Link>.
      </p>

      <h2>2. App, widget, and register</h2>
      <p>
        Live Hive does not create the Live Activity. You still need ActivityKit,
        a WidgetKit extension, Push Notifications, and a physical iPhone.
        Simulator will not prove APNs.
      </p>
      <p>
        Put <code>DeliveryAttributes</code> in a file (or small framework)
        shared by the app and the widget. In the app Info.plist:
      </p>
      <pre>
        <code>{PLIST}</code>
      </pre>
      <p>
        Enable the Push Notifications capability on the app target. Then:
      </p>
      <pre>
        <code>{SWIFT}</code>
      </pre>
      <p>
        Widget (same <code>ContentState</code> keys you will send over HTTP):
      </p>
      <pre>
        <code>{WIDGET}</code>
      </pre>
      <p>
        Run on a device. After Start, copy <code>activity.id</code>. Wait a few
        seconds so the SDK can POST the push token.
      </p>

      <h2>3. Update and end (HTTP)</h2>
      <p>
        Replace <code>ACTIVITY_ID</code> with <code>activity.id</code>. POST JSON
        to <code>{CANONICAL_API_BASE}</code> with <code>lh_live_</code>.{' '}
        <code>content_state</code> must match the widget{' '}
        <code>ContentState</code>.
      </p>
      <pre>
        <code>{CURL}</code>
      </pre>
      <p>Same calls in a backend (any language works):</p>
      <BackendSnippet />
      <p>
        Routes:{' '}
        <Link href="/docs/activities/register">register</Link>,{' '}
        <Link href="/docs/activities/update">update</Link>,{' '}
        <Link href="/docs/activities/end">end</Link>.
      </p>

      <h2>4. Confirm delivery</h2>
      <p>
        Lock the phone. The Live Activity should change after the update POST.
        The dashboard activity page shows the last APNs result. If Apple
        rejected the push, the reason is there.
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
        <li>Depend on this GitHub repo as a Swift package. Use livehive-ios.</li>
      </ul>
    </>
  )
}
