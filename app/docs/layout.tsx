import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { TrackDocs } from '@/components/TrackPage'

const DOCS_NAV = [
  { href: '/docs/getting-started', label: 'Getting started' },
  { href: '/docs/authentication', label: 'Authentication' },
  { href: '/docs/activities', label: 'Activities' },
  { href: '/docs/activities/register', label: 'Create' },
  { href: '/docs/activities/update', label: 'Update' },
  { href: '/docs/activities/end', label: 'End' },
  { href: '/docs/apns', label: 'APNs' },
  { href: '/docs/errors', label: 'Errors' },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="mb-3 text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
            Documentation
          </p>
          <nav className="flex flex-col gap-1">
            {DOCS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 text-[14px] text-[var(--color-muted)] hover:bg-white/[0.03] hover:text-[var(--color-ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 mb-3 text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
            Guides
          </p>
          <nav className="flex flex-col gap-1">
            <Link
              href="/guides/live-activity-backend"
              className="rounded-lg px-3 py-1.5 text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Live Activity backend
            </Link>
            <Link
              href="/guides/activitykit-push-notifications"
              className="rounded-lg px-3 py-1.5 text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              ActivityKit push
            </Link>
            <Link
              href="/guides/live-activity-apns"
              className="rounded-lg px-3 py-1.5 text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Live Activity APNs
            </Link>
          </nav>
        </aside>
        <article className="docs-prose max-w-2xl pb-16">{children}</article>
      </div>
      <TrackDocs path="/docs" />
      <Footer />
    </div>
  )
}
