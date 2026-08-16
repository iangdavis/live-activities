import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/ui'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div>
      <PageHeader title="Settings" />
      <section className="surface-card max-w-lg p-6">
        <h2 className="text-[16px] text-[var(--color-ink)]">Account</h2>
        <dl className="mt-4 space-y-3 text-[14px]">
          <div>
            <dt className="text-[var(--color-faint)]">Email</dt>
            <dd className="mt-1 text-[var(--color-ink)]">{session.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-faint)]">Name</dt>
            <dd className="mt-1 text-[var(--color-ink)]">{session.name ?? '—'}</dd>
          </div>
        </dl>
        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button type="submit" className="btn-ghost">
            Log out
          </button>
        </form>
      </section>
    </div>
  )
}
