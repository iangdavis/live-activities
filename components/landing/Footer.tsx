import Link from 'next/link'
import { site } from '@/lib/config'
import { Logo } from './Logo'
import { GitHubIcon, XIcon } from './icons'

export function Footer() {
  const { github, x, contact } = site.links

  const links: { label: string; href: string; icon?: React.ReactNode }[] = [
    { label: 'Docs', href: '/docs' },
    { label: 'iOS SDK', href: '/docs/ios' },
    { label: 'Pricing', href: '/pricing' },
  ]
  if (github) links.push({ label: 'GitHub', href: github, icon: <GitHubIcon /> })
  if (x) links.push({ label: 'X', href: x, icon: <XIcon /> })
  if (contact) links.push({ label: 'Contact', href: contact })

  return (
    <footer className="border-t border-[color:var(--color-line)]">
      <div className="container-page flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <Link href="/" className="flex items-center gap-2.5" aria-label={site.productName}>
          <Logo size={24} />
          <span className="font-display text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">
            {site.productName}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {links.map((link) => {
            const external = link.href.startsWith('http') || link.href.startsWith('mailto:')
            return (
              <Link
                key={link.label}
                href={link.href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="inline-flex items-center gap-2 text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>

        <p className="text-[13px] text-[var(--color-faint)]">
          &copy; 2026 {site.productName}
        </p>
      </div>
    </footer>
  )
}
