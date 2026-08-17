import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'iOS SDK',
  description:
    'Configure the Live Hive iOS SDK with a public key and register ActivityKit Live Activities. No token-registration server required.',
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
      <p>
        In Xcode: File → Add Package Dependencies, add{' '}
        <code>https://github.com/iangdavis/live-activities</code>, version{' '}
        <code>0.1.0</code> or later. Then add the <code>LiveHive</code> product
        to your app target.
      </p>
      <pre>
        <code>{`.package(url: "https://github.com/iangdavis/live-activities.git", from: "0.1.0")`}</code>
      </pre>
      <p>
        Production posts to{' '}
        <code>https://api.livehive.dev/v1/activities/register</code>. Override{' '}
        <code>baseURL</code> only for local development. A local checkout of{' '}
        <code>sdks/ios</code> still works (Add Local).
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
        no server SDK.
      </p>
    </>
  )
}
