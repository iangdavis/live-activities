import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from '@/lib/api-contract'
import { appStartSnippet, SPM_PACKAGE_URL } from '@/lib/xcode-setup'

export const metadata: Metadata = {
  title: 'iOS SDK',
  description:
    'LiveHive.start requests a Live Activity and registers its push token. Your widget and ActivityAttributes stay in your app.',
  alternates: { canonical: '/docs/ios' },
}

export default function IosSdkDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">iOS SDK</h1>
      <p className="mt-4">
        Swift package that starts a Live Activity and POSTs its push token to
        Live Hive. Updates and ends come from the dashboard or your API. Your{' '}
        <code>ActivityAttributes</code> and widget UI stay in your Xcode
        project so you can customize them. Walkthrough:{' '}
        <Link href="/docs/getting-started">Getting started</Link>.
      </p>
      <pre>
        <code>{appStartSnippet(null)}</code>
      </pre>
      <h2>Install</h2>
      <p>
        File → Add Package Dependencies. Paste{' '}
        <code>{SPM_PACKAGE_URL}</code>. Choose <code>{IOS_SDK_VERSION}</code> or
        later. Add <code>LiveHive</code> to the app target.
      </p>
      <pre>
        <code>{`.package(url: "${IOS_SDK_PACKAGE_URL}", from: "${IOS_SDK_VERSION}")`}</code>
      </pre>
      <p>
        Production posts to{' '}
        <code>{CANONICAL_API_BASE}/activities/register</code>. Override{' '}
        <code>baseURL</code> only for local development.
      </p>
      <ul>
        <li>
          <code>LiveHive.start(attributes:contentState:)</code> is{' '}
          <code>Activity.request(..., pushType: .token)</code> plus register.
        </li>
        <li>
          Already called <code>Activity.request</code>?{' '}
          <code>LiveHive.register(activity)</code>.
        </li>
        <li>Retries 429 and 5xx. Replaces the token when ActivityKit rotates it.</li>
        <li>
          <code>configure</code> takes <code>lh_pub_...</code>. The server key
          stays in your API.
        </li>
      </ul>
      <p>
        First success: dashboard <strong>Send test update</strong> (uses{' '}
        <code>status</code> and <code>eta</code>, matching the getting started
        sample). Then your backend POSTs{' '}
        <Link href="/docs/activities/update">update</Link> and{' '}
        <Link href="/docs/activities/end">end</Link>.
      </p>
    </>
  )
}
