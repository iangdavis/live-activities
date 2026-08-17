import type { Metadata } from 'next'
import Link from 'next/link'
import { LLMS_TXT } from '@/lib/llms-txt'

export const metadata: Metadata = {
  title: 'For agents',
  description:
    'Live Hive contract for coding agents: iOS SDK on device, HTTP from any backend. No server SDK.',
  alternates: { canonical: '/docs/for-agents' },
}

export default function ForAgentsPage() {
  return (
    <>
      <h1 className="text-[32px]">For agents</h1>
      <p className="mt-4">
        Machine-readable copies:{' '}
        <Link href="/llms.txt">/llms.txt</Link> and{' '}
        <Link href="/openapi.json">/openapi.json</Link>. The iOS SDK is the only
        SDK. Backends speak HTTP in any language.
      </p>
      <pre>
        <code>{LLMS_TXT}</code>
      </pre>
    </>
  )
}
