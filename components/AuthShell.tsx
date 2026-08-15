import Link from 'next/link'
import { Logo } from '@/components/landing/Logo'
import { site } from '@/lib/config'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-ambient flex min-h-screen flex-col">
      <header className="container-page flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-[15px] font-semibold text-[var(--color-ink)]">
            {site.productName}
          </span>
        </Link>
      </header>
      <main className="container-page flex flex-1 items-start justify-center py-16">
        <div className="surface-card w-full max-w-md p-7">
          <h1 className="text-[26px]">{title}</h1>
          <p className="mt-2 text-[15px] text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
