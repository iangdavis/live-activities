import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CANONICAL_API_BASE,
  IOS_SDK_PACKAGE_URL,
  IOS_SDK_VERSION,
} from '@/lib/api-contract'

export const metadata: Metadata = {
  title: 'iOS SDK',
  description:
    'Install Live Hive with Swift Package Manager. Configure a public key and register ActivityKit Live Activities.',
  alternates: { canonical: '/docs/ios' },
}

export default function IosSdkDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">iOS SDK</h1>
      <p className="mt-4">
        A small Swift package that sends ActivityKit push tokens to Live Hive.
        It does not create the Live Activity, define attributes, or replace
        WidgetKit.
      </p>
      <pre>
        <code>{`import LiveHive

LiveHive.configure(publicKey: "lh_pub_...")
LiveHive.register(activity)`}</code>
      </pre>
      <h2>Install</h2>
      <p>
        In Xcode: File → Add Package Dependencies. Paste{' '}
        <code>{IOS_SDK_PACKAGE_URL.replace(/\.git$/, '')}</code>. Choose{' '}
        <code>{IOS_SDK_VERSION}</code> or later. Add the <code>LiveHive</code>{' '}
        library to your app target.
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
        <li>Uses <code>URLSession</code> — no extra networking library.</li>
        <li>Converts token <code>Data</code> to lowercase hex.</li>
        <li>Retries 429 and 5xx responses.</li>
        <li>Replaces the stored token when ActivityKit rotates it.</li>
        <li>Rejects server keys (<code>lh_live_...</code>).</li>
      </ul>
      <p>
        Your backend still POSTs{' '}
        <Link href="/docs/activities/update">update</Link> and{' '}
        <Link href="/docs/activities/end">end</Link> with a secret key. There is
        no server SDK. Walkthrough:{' '}
        <Link href="/docs/getting-started">Getting started</Link>.
      </p>
    </>
  )
}
