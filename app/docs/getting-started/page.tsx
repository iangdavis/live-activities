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
  SPM_PACKAGE_URL,
  widgetBundleSnippet,
} from '@/lib/xcode-setup'

export const metadata: Metadata = {
  title: 'Getting started',
  description:
    'Paste the Live Hive Swift package, call LiveHive.start(), then send a test update from the dashboard. HTTP from your backend when you are ready.',
  alternates: { canonical: '/docs/getting-started' },
}

const PLIST = `<key>NSSupportsLiveActivities</key>
<true/>`

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-[32px]">Getting started</h1>
      <p className="mt-4">
        You still create an iOS app and a Widget Extension. Live Hive ships the
        delivery Live Activity, starts it, registers the push token, and can
        send the first update from the dashboard. Your backend is optional until
        then. There is no server SDK.{' '}
        <Link href="/llms.txt">/llms.txt</Link> ·{' '}
        <Link href="/openapi.json">/openapi.json</Link>.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5">
        <li>
          <Link href="/signup">Create a Live Hive account</Link> and a project.
        </li>
        <li>
          Add Apple credentials. See <Link href="/docs/apns">APNs</Link>.{' '}
          <strong>Sandbox</strong> for an Xcode debug build,{' '}
          <strong>production</strong> for TestFlight. Mixing them is{' '}
          <code>BadDeviceToken</code>. The bundle ID on that form is the string
          you paste in Xcode. Organization Identifier is everything before the
          last dot.
        </li>
        <li>
          Copy the <strong>iOS Public Key</strong> (<code>lh_pub_...</code>).
          Never put <code>lh_live_</code> in the app.
        </li>
        <li>Paste the Swift package, call <code>LiveHive.start()</code>.</li>
        <li>
          Open the activity in the dashboard → <strong>Send test update</strong>
          . Write HTTP when you actually have a backend.
        </li>
      </ol>

      <h2>1. Add the iOS SDK</h2>
      <p>
        New <strong>iOS App</strong> (not multiplatform / not Mac). Do not name
        the app module <code>LiveHive</code> or <code>livehive</code>.
      </p>
      <p>
        File → Add Package Dependencies. <strong>Paste</strong> the URL. Do not
        type “Live Hive” in the search box — that list is Apple’s packages.
      </p>
      <pre>
        <code>{SPM_PACKAGE_URL}</code>
      </pre>
      <p>
        Choose version <code>{IOS_SDK_VERSION}</code> or later (Up to Next
        Major). Add the <code>LiveHive</code> library to the{' '}
        <strong>app</strong> and the <strong>widget</strong> targets.
      </p>
      <pre>
        <code>{`.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`}</code>
      </pre>
      <p>
        Details: <Link href="/docs/ios">iOS SDK</Link>.
      </p>

      <h2>2. Widget + plist + start</h2>
      <p>
        File → New → Target → Widget Extension → Include Live Activity. App
        target Info.plist (or Build Settings{' '}
        <code>INFOPLIST_KEY_NSSupportsLiveActivities</code> if the Info tab
        looks like macOS):
      </p>
      <pre>
        <code>{PLIST}</code>
      </pre>
      <p>
        Enable Push Notifications on the <strong>app</strong>. Widget bundle:
      </p>
      <pre>
        <code>{widgetBundleSnippet()}</code>
      </pre>
      <p>App:</p>
      <pre>
        <code>{appStartSnippet(null)}</code>
      </pre>
      <p>
        Run on an iPhone destination (simulator is enough to get an{' '}
        <code>activity.id</code>; a phone proves APNs). After Start, the
        dashboard Activities list gets a row.
      </p>

      <h2>3. First update (no backend)</h2>
      <p>
        Open that activity → <strong>Send test update</strong>. Live Hive
        pushes <code>{`{ status: "driver_arriving", eta: 4 }`}</code>. Optional:{' '}
        <strong>Drive demo</strong> runs another update then ends. The phone
        never sees <code>lh_live_</code>.
      </p>

      <h2>4. Your backend later</h2>
      <p>
        Same JSON, any language. Copy the curl on the activity page — it already
        has the real <code>activity_id</code>. Host{' '}
        <code>{CANONICAL_API_BASE}</code>, no trailing slash.
      </p>
      <BackendSnippet />
      <p>
        Routes:{' '}
        <Link href="/docs/activities/register">register</Link>,{' '}
        <Link href="/docs/activities/update">update</Link>,{' '}
        <Link href="/docs/activities/end">end</Link>.
      </p>

      <h2>Do not</h2>
      <ul>
        <li>Put <code>lh_live_</code> in the iOS app or widget.</li>
        <li>Build a token-forwarding or token-registration server.</li>
        <li>Look for a server SDK. Backend is HTTP.</li>
        <li>
          Skip the Widget Extension, <code>NSSupportsLiveActivities</code>, or{' '}
          <code>pushType: .token</code> (that last one is inside{' '}
          <code>LiveHive.start()</code>).
        </li>
        <li>Use the public key for update or end.</li>
        <li>Depend on this GitHub repo as a Swift package. Use livehive-ios.</li>
        <li>Search Xcode’s Apple package list for Live Hive. Paste the URL.</li>
      </ul>
    </>
  )
}
