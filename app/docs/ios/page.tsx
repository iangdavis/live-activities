import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from '@/lib/api-contract'
import { SPM_PACKAGE_URL, widgetBundleSnippet } from '@/lib/xcode-setup'

export const metadata: Metadata = {
  title: 'iOS SDK',
  description:
    'LiveHive.start() requests a Live Activity and registers its push token. DeliveryAttributes and a canned widget ship in the package.',
  alternates: { canonical: '/docs/ios' },
}

export default function IosSdkDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">iOS SDK</h1>
      <p className="mt-4">
        Swift package that starts a Live Activity and POSTs its push token to
        Live Hive. It does not update or end the activity. Add a Widget
        Extension target; instantiate <code>DeliveryLiveActivity</code> from
        the package.
      </p>
      <pre>
        <code>{`import LiveHive

LiveHive.configure(publicKey: "lh_pub_...")
let activity = try LiveHive.start()
print(activity.id)`}</code>
      </pre>
      <h2>Install</h2>
      <p>
        File → Add Package Dependencies. Paste{' '}
        <code>{SPM_PACKAGE_URL}</code>. Do not search “Live Hive”. Choose{' '}
        <code>{IOS_SDK_VERSION}</code> or later. Add <code>LiveHive</code> to
        the app <strong>and</strong> the widget. Do not name the app module{' '}
        <code>LiveHive</code>.
      </p>
      <pre>
        <code>{`.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`}</code>
      </pre>
      <p>
        Production posts to{' '}
        <code>{CANONICAL_API_BASE}/activities/register</code>. Override{' '}
        <code>baseURL</code> only for local development.
      </p>
      <h2>Widget</h2>
      <pre>
        <code>{widgetBundleSnippet()}</code>
      </pre>
      <p>
        App target: <code>NSSupportsLiveActivities</code> = YES. Push
        Notifications capability on the app. <code>start()</code> throws if the
        plist flag is missing or Live Activities are disabled in Settings.
      </p>
      <ul>
        <li>
          <code>DeliveryAttributes</code> — <code>status: String</code>,{' '}
          <code>eta: Int</code>. Dashboard test updates use that shape.
        </li>
        <li>
          Custom attributes: <code>LiveHive.start(attributes:contentState:)</code>{' '}
          or <code>Activity.request</code> + <code>LiveHive.register(activity)</code>.
        </li>
        <li>Retries 429 and 5xx. Replaces the token when ActivityKit rotates it.</li>
        <li>Rejects server keys (<code>lh_live_...</code>).</li>
      </ul>
      <p>
        First success: dashboard <strong>Send test update</strong>. Later, your
        backend POSTs <Link href="/docs/activities/update">update</Link> and{' '}
        <Link href="/docs/activities/end">end</Link>. There is no server SDK.
        Walkthrough: <Link href="/docs/getting-started">Getting started</Link>.
      </p>
    </>
  )
}
