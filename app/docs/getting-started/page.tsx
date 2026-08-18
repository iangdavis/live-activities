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

const PLIST = `<key>NSSupportsLiveActivities</key>
<true/>`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-[32px]">Getting started</h1>
      <p className="mt-4">
        You already have an iOS app in Xcode. This walkthrough adds a Live
        Activity and lets Live Hive push updates to it. The sample UI uses{' '}
        <code>status</code> and <code>eta</code> — same keys the dashboard test
        update sends. Change the Swift structs when you want a different layout;
        keep your API <code>content_state</code> in sync.
      </p>

      <h2>1. Apple Developer</h2>
      <p>
        In{' '}
        <a href="https://developer.apple.com/account/resources/identifiers/list">
          Identifiers
        </a>
        , open the App ID that matches your Xcode bundle ID. Enable{' '}
        <strong>Push Notifications</strong> and <strong>Live Activities</strong>.
      </p>
      <p>
        In{' '}
        <a href="https://developer.apple.com/account/resources/authkeys/list">
          Keys
        </a>
        , create a key with Apple Push Notifications service (APNs). Download
        the <code>.p8</code> once. Note the <strong>Team ID</strong> (Membership)
        and the <strong>Key ID</strong>.
      </p>

      <h2>2. Live Hive</h2>
      <p>
        <Link href="/signup">Create an account</Link> and a project. On the
        project page, paste Team ID, Key ID, the <code>.p8</code> contents, and
        your app bundle ID. Choose <strong>sandbox</strong> while you run from
        Xcode, <strong>production</strong> for TestFlight or the App Store.
      </p>
      <p>
        Copy the <strong>iOS Public Key</strong> (<code>lh_pub_...</code>) for
        the app. Copy the <strong>Server API Key</strong> (<code>lh_live_...</code>)
        when you wire your API. The project page also shows the Organization
        Identifier Xcode expects: everything before the last dot of that bundle
        ID.
      </p>

      <h2>3. Xcode</h2>
      <p>
        File → New → Target… → <strong>Widget Extension</strong> → check{' '}
        <strong>Include Live Activity</strong>. Xcode registers a widget bundle
        ID under your app (for example <code>com.example.app.widget</code>).
        Live Hive’s APNs field stays the <strong>app</strong> bundle ID.
      </p>
      <p>
        On the <strong>app</strong> target: add the Push Notifications
        capability, and set Live Activities on:
      </p>
      <pre>
        <code>{PLIST}</code>
      </pre>
      <p>
        If the Info tab only lists macOS keys, set Build Settings{' '}
        <code>INFOPLIST_KEY_NSSupportsLiveActivities</code> to <code>YES</code>.
      </p>
      <p>
        File → Add Package Dependencies, paste this URL, version{' '}
        <code>{IOS_SDK_VERSION}</code> or later. Add the <code>LiveHive</code>{' '}
        library to the <strong>app</strong> target.
      </p>
      <pre>
        <code>{SPM_PACKAGE_URL}</code>
      </pre>
      <pre>
        <code>{`.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`}</code>
      </pre>
      <p>
        Add one Swift file to <strong>both</strong> the app and the widget
        (File inspector → Target Membership). This is the data model. Rename
        fields when you customize; the HTTP JSON uses the same names.
      </p>
      <pre>
        <code>{attributesSnippet()}</code>
      </pre>
      <p>
        In the widget target, replace the generated Live Activity with this UI.
        Tweak the SwiftUI whenever you want a different lock screen or Dynamic
        Island.
      </p>
      <pre>
        <code>{liveActivityWidgetSnippet()}</code>
      </pre>
      <p>
        The widget’s <code>@main</code> bundle should instantiate that widget:
      </p>
      <pre>
        <code>{widgetBundleSnippet()}</code>
      </pre>

      <h2>4. iOS SDK</h2>
      <p>
        In the app, configure with the public key from Live Hive, then start.{' '}
        <code>LiveHive.start</code> requests the Live Activity with{' '}
        <code>pushType: .token</code> and registers the push token.
      </p>
      <pre>
        <code>{appStartSnippet(null)}</code>
      </pre>
      <p>
        Run on an iPhone destination. After Start, <code>activity.id</code> is
        the id Live Hive and your API will use. Details:{' '}
        <Link href="/docs/ios">iOS SDK</Link>.
      </p>

      <h2>5. Live Hive again</h2>
      <p>
        The project’s Activities list shows the new row. Open it and tap{' '}
        <strong>Send test update</strong>. Live Hive pushes{' '}
        <code>{`{ "status": "driver_arriving", "eta": 4 }`}</code> through APNs.
        <strong>Drive demo</strong> sends a second update, then ends. Lock the
        phone (or glance at the Dynamic Island) to confirm.
      </p>

      <h2>6. Your API</h2>
      <p>
        Same JSON from your server, any language. Authorization is the server
        key. The activity page has curl with this activity’s id already filled
        in. Host <code>{CANONICAL_API_BASE}</code>.
      </p>
      <pre>
        <code>{`POST ${CANONICAL_API_BASE}/activities/{activity_id}/update
Authorization: Bearer lh_live_...

{ "content_state": { "status": "driver_arriving", "eta": 4 } }`}</code>
      </pre>
      <BackendSnippet />
      <p>
        When the job is finished:{' '}
        <code>POST …/activities/{'{activity_id}'}/end</code> with a matching{' '}
        <code>content_state</code>. Routes:{' '}
        <Link href="/docs/activities/update">update</Link>,{' '}
        <Link href="/docs/activities/end">end</Link>.
      </p>
    </>
  )
}
