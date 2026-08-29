'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppSidebarNav({
  items,
}: {
  items: { href: string; label: string }[]
}) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
      {items.map((item) => {
        const active =
          item.label === 'Setup'
            ? pathname === '/setup' || pathname.startsWith('/projects/')
            : item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[14px] transition ${
              active
                ? 'bg-white/[0.06] text-[var(--color-ink)]'
                : 'text-[var(--color-muted)] hover:bg-white/[0.03] hover:text-[var(--color-ink)]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
