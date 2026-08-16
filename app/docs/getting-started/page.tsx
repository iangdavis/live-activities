import type { Metadata } from 'next'
import Link from 'next/link'

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

const BACKEND = `const LIVEHIVE = 'https://livehive.dev/api/v1'
const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

async function livehive(path, body) {
  const res = await fetch(\`\${LIVEHIVE}\${path}\`, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Phone started the Live Activity and posted the token to you.
await livehive('/activities', {
  activity_id: 'abc123',
  push_token: tokenFromThePhone,
})

await livehive('/activities/abc123/update', {
  content_state: { status: 'driver_arriving', eta: 4 },
})

await livehive('/activities/abc123/end', {
  content_state: { status: 'delivered', eta: 0 },
})`

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
          Create an API key. Copy it once. It starts with <code>lh_live_</code>.
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
        <li>From your backend, register that token with Live Hive.</li>
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
        POSTs: register, update, end. The iOS app does not call these. Keep{' '}
        <code>lh_live_</code> in server env, never in the binary.
      </p>
      <p>
        <code>fetch</code> below is copy-paste for Node, Bun, Deno, or any
        runtime with fetch. Python, Go, Rails, and PHP do the same HTTP.
      </p>
      <pre>
        <code>{BACKEND}</code>
      </pre>
      <p>
        Terminal equivalent:{' '}
        <Link href="/docs/activities/register">register</Link>,{' '}
        <Link href="/docs/activities/update">update</Link>,{' '}
        <Link href="/docs/activities/end">end</Link>.
      </p>

      <h2>3. Confirm delivery</h2>
      <p>
        Open the dashboard. The activity should appear with a last delivery
        result. If APNs rejected the push, the error reason is on the activity
        page.
      </p>
    </>
  )
}
