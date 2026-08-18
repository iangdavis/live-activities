import type { Metadata } from 'next'
import Link from 'next/link'
import { BackendSnippet } from '@/components/docs/BackendSnippet'
import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from '@/lib/api-contract'
import {
  appStartSnippet,
  attributesSnippet,
  liveActivityWidgetSnippet,
  SPM_PACKAGE_URL,
  widgetBundleSnippet,
} from '@/lib/xcode-setup'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Add a Live Activity to an existing iOS app: Apple Developer, Live Hive, Xcode, the iOS SDK, then your API.',
  alternates: { canonical: '/docs/getting-started' },
}

const PLIST = `<key>NSSupportsLiveActivities</key>\n<true/>`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-[32px]">Getting started</h1>

      <p className="mt-4">
        Add Live Hive to your existing iOS app so your app can start a Live
        Activity and Live Hive will deliver server-controlled updates via APNs.
        This guide is a quick path to your first visible update — it assumes you
        already have an iOS app/Xcode project.
      </p>

      <h2 className="mt-6">1. Prerequisites</h2>
      <ul className="mt-2 list-disc pl-6">
        <li>Existing iOS app and Xcode project (device required for Live Activities)</li>
        <li>Apple Developer account (App ID with Push Notifications & Live Activities)</li>
        <li>Xcode compatible with the iOS SDK version below</li>
        <li>Live Hive account (create a project in the dashboard)</li>
      </ul>

      <h2 className="mt-6">2. Create a Live Hive project</h2>
      <p>
        In the Live Hive dashboard create a project and enter your app’s Bundle
        Identifier (the same bundle ID you use to run the app on device). Upload
        your APNs <code>.p8</code> key (Team ID and Key ID) and pick <strong>sandbox</strong>
        while testing from Xcode, <strong>production</strong> for TestFlight/App Store.
      </p>
      <p>
        Copy these keys from the project page:
      </p>
      <ul className="mt-2 list-disc pl-6">
        <li>
          <strong>iOS public key</strong> (<code>lh_pub_…</code>) — safe to include
          in the iOS app.
        </li>
        <li>
          <strong>Server API key</strong> (<code>lh_live_…</code>) — secret: keep on
          your backend only.
        </li>
      </ul>

      <h2 className="mt-6">3. Install the SDK (Swift Package Manager)</h2>
      <p>
        In Xcode: File → Add Package Dependencies. Paste the package URL and
        choose the version below. Add <code>LiveHive</code> to the <strong>app</strong> target.
      </p>
      <pre className="mt-2">
        <code>{SPM_PACKAGE_URL}</code>
      </pre>
      <pre className="mt-2">
        <code>{`.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`}</code>
      </pre>

      <h2 className="mt-6">4. Xcode setup</h2>
      <p>
        Add a Widget Extension (File → New → Target… → Widget Extension) and
        check <strong>Include Live Activity</strong>. On the app target enable
        Push Notifications and set <code>NSSupportsLiveActivities</code> in
        your Info.plist:
      </p>
      <pre className="mt-2">
        <code>{PLIST}</code>
      </pre>

      <h2 className="mt-6">5. Start a Live Activity (minimal)</h2>
      <p>
        The SDK exposes a small API: configure with the public key, then start
        the activity. The SDK requests the Activity with <code>pushType: .token</code>
        and registers the push token with Live Hive.
      </p>

      <h3 className="mt-3">Shared attributes (app + widget)</h3>
      <pre className="mt-2">
        <code>{attributesSnippet()}</code>
      </pre>

      <h3 className="mt-3">Live Activity UI (widget)</h3>
      <p className="mt-1">Replace the generated Live Activity with this minimal UI.</p>
      <pre className="mt-2">
        <code>{liveActivityWidgetSnippet()}</code>
      </pre>

      <h3 className="mt-3">App: configure and start</h3>
      <p className="mt-1">Configure with the public key and start the activity.</p>
      <pre className="mt-2">
        <code>{appStartSnippet(null)}</code>
      </pre>
      <p className="mt-2">
        The SDK method <code>LiveHive.start</code> is ActivityKit’s
        <code>Activity.request(..., pushType: .token)</code> plus token registration
        so Live Hive can deliver updates.
      </p>

      <h2 className="mt-6">6. Test the Activity (fast validation)</h2>
      <p>
        This is the critical onboarding step: the dashboard <strong>Send test update</strong>
        lets you validate APNs and delivery before writing any backend code.
      </p>
      <ol className="mt-2 list-decimal pl-6">
        <li>Run the app on a supported iPhone and trigger the Start action.</li>
        <li>Open the Live Hive dashboard → project → Activities. Find the row for your activity.</li>
        <li>Click <strong>Send test update</strong>. The dashboard sends a sample
          update (the getting-started sample uses <code>status</code> and <code>eta</code>).</li>
        <li>Watch the Dynamic Island / Lock Screen on the device for the update.</li>
      </ol>
      <p className="mt-2">
        If the test update succeeds you have validated your APNs configuration and
        device registration — you can now implement your backend.
      </p>

      <h2 className="mt-6">7. Backend integration (production flow)</h2>
      <p>
        Production flow: your backend → Live Hive API → Apple APNs → iPhone.
        Authenticate API requests from your server using the server key (<code>lh_live_…</code>).
      </p>
      <pre className="mt-2">
        <code>{`POST ${CANONICAL_API_BASE}/activities/{activity_id}/update\nAuthorization: Bearer lh_live_...\nContent-Type: application/json\n\n{ "content_state": { "status": "driver_arriving", "eta": 4 } }`}</code>
      </pre>
      <BackendSnippet />
      <p className="mt-2">
        The OpenAPI spec is authoritative for the full request schema and other
        routes: <a href="/openapi.json">/openapi.json</a>.
      </p>

      <h2 className="mt-6">8. Security (important)</h2>
      <div className="surface-card mt-2 border-l-4 border-[color:var(--color-accent)] p-4">
        <p className="font-semibold">Key usage</p>
        <ul className="mt-1 list-disc pl-6">
          <li><code>lh_pub_…</code> — public: goes in the iOS app (LiveHive.configure).</li>
          <li><code>lh_live_…</code> — secret: only on your backend; never embed in an iOS binary.</li>
        </ul>
      </div>

      <h2 className="mt-6">9. Next steps</h2>
      <ul className="mt-2 list-disc pl-6">
        <li><Link href="/docs/ios">iOS SDK reference</Link></li>
        <li><Link href="/docs/activities">Activity docs (register, update, end)</Link></li>
        <li><Link href="/docs/apns">APNs troubleshooting</Link></li>
        <li><Link href="/guides/live-activity-backend">Backend integration guide</Link></li>
      </ul>

      <p className="mt-6 text-[13px] text-[var(--color-muted)]">
        This quick-start is focused on time-to-first-success. For full
        ActivityKit/WidgetKit implementation details and UI patterns, see the
        iOS SDK docs and the Activity UI guide linked above.
      </p>
    </>
  )
}
