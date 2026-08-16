import type { Metadata } from 'next'
import Link from 'next/link'
import { BackendSnippet } from '@/components/docs/BackendSnippet'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Start an iOS Live Activity in Swift, send the push token to your backend, and update it through the Live Hive API.',
  alternates: { canonical: '/docs/getting-started' },
}

const SWIFT = `import ActivityKit
import Foundation

struct DeliveryAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var eta: Int
  }
}

func startDelivery(activityId: String) async throws {
  let activity = try Activity.request(
    attributes: DeliveryAttributes(),
    content: .init(
      state: .init(status: "preparing", eta: 12),
      staleDate: nil
    ),
    pushType: .token
  )

  Task {
    for await tokenData in activity.pushTokenUpdates {
      let token = tokenData.map { String(format: "%02x", $0) }.joined()
      try? await sendTokenToYourBackend(activityId: activityId, pushToken: token)
    }
  }
}

func sendTokenToYourBackend(activityId: String, pushToken: String) async throws {
  var request = URLRequest(url: URL(string: "https://api.yourapp.com/live-activities")!)
  request.httpMethod = "POST"
  request.setValue("application/json", forHTTPHeaderField: "Content-Type")
  request.httpBody = try JSONEncoder().encode([
    "activity_id": activityId,
    "push_token": pushToken,
  ])
  _ = try await URLSession.shared.data(for: request)
}`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-[32px]">Getting started</h1>
      <p className="mt-4">
        Live Hive is an HTTP API for your backend. The iOS app still starts the
        Live Activity and reads the push token. Do not put an{' '}
        <code>lh_live_</code> key in the app.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5">
        <li>
          <Link href="/signup">Create a Live Hive account</Link> and a project.
        </li>
        <li>
          Create an API key on the project page. Copy it once. It starts with{' '}
          <code>lh_live_</code>.
        </li>
        <li>
          Add your Apple APNs credentials on the project page. See{' '}
          <Link href="/docs/apns">APNs setup</Link>.
        </li>
        <li>
          In the iOS app, enable Live Activities (
          <code>NSSupportsLiveActivities</code>), add a WidgetKit extension, and
          start the activity with a push token.
        </li>
        <li>From your backend, create the activity in Live Hive (send the push token).</li>
        <li>When your domain state changes, POST an update. When it is done, POST end.</li>
      </ol>

      <h2>1. Start the activity (Swift)</h2>
      <p>
        <code>content_state</code> later must match this{' '}
        <code>ContentState</code>. Observe <code>pushTokenUpdates</code> — the
        token can rotate. Send it to <em>your</em> server, not to Live Hive.
      </p>
      <pre>
        <code>{SWIFT}</code>
      </pre>

      <h2>2. Call Live Hive from your backend</h2>
      <p>
        Your server is written in whatever. Live Hive is three authenticated
        POSTs: create, update, end. The iOS app does not call these. Keep{' '}
        <code>lh_live_</code> in server env, never in the binary.
      </p>
      <BackendSnippet />
      <p>
        Same routes:{' '}
        <Link href="/docs/activities/register">create</Link>,{' '}
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
