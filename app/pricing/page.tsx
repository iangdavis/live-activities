import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Pricing } from '@/components/landing/Pricing'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Live Hive pricing: free for up to 100 activities per month, then $0.01 per live activity.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-8">
        <Pricing />
        <p className="container-page pb-16 text-center text-[14px] text-[var(--color-muted)]">
          Questions? Read the{' '}
          <Link href="/docs" className="text-[var(--color-accent-soft)] underline-offset-2 hover:underline">
            docs
          </Link>
          .
        </p>
      </main>
      <Footer />
    </div>
  )
}
