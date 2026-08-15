import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { TrackDocs } from '@/components/TrackPage'

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-page py-12">
        <p className="mb-6 text-[13px] text-[var(--color-faint)]">
          <Link href="/docs" className="hover:text-[var(--color-ink)]">
            Docs
          </Link>
          <span className="mx-2">/</span>
          Guides
        </p>
        <article className="docs-prose max-w-2xl pb-16">{children}</article>
      </div>
      <TrackDocs path="/guides" />
      <Footer />
    </div>
  )
}
