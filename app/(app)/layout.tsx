import Link from 'next/link'
import { Logo } from '@/components/landing/Logo'
import { site } from '@/lib/config'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AppSidebarNav } from '@/components/dashboard/AppSidebarNav'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const firstProject = await prisma.project.findFirst({
    where: { accountId: session.accountId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: firstProject ? `/projects/${firstProject.id}` : '/setup', label: 'Setup' },
    { href: '/logs', label: 'Logs' },
    { href: '/docs', label: 'Docs' },
    { href: '/settings', label: 'Settings' },
  ]

  const greetingName = session.name?.trim() || session.email.split('@')[0] || 'there'

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-[color:var(--color-line)] md:border-b-0 md:border-r">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="font-display text-[14px] font-semibold text-[var(--color-ink)]">
              {site.productName}
            </span>
          </Link>
        </div>
        <AppSidebarNav items={nav} />
        <form action="/api/auth/logout" method="POST" className="hidden px-3 pb-6 md:block">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-[14px] text-[var(--color-faint)] hover:text-[var(--color-ink)]"
          >
            Log out
          </button>
        </form>
      </aside>
      <div>
        <header className="flex h-16 items-center justify-end border-b border-[color:var(--color-line)] px-6 text-[13px] text-[var(--color-muted)]">
          Hi, {greetingName}
        </header>
        <div className="px-6 py-8">{children}</div>
      </div>
    </div>
  )
}
