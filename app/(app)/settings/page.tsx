import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/ui'
import { prisma } from '@/lib/db'
import { currentMonthKey, FREE_TIER } from '@/lib/plan'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const month = currentMonthKey()
  let account: { plan: 'free' | 'paid' } | null = null
  let usage: { units: number } | null = null

  try {
    ;[account, usage] = await Promise.all([
      prisma.account.findUnique({
        where: { id: session.accountId },
        select: { plan: true },
      }),
      prisma.accountUsageMonth.findUnique({
        where: {
          accountId_month: {
            accountId: session.accountId,
            month,
          },
        },
        select: { units: true },
      }),
    ])
  } catch (error) {
    console.error('settings billing summary failed', error)
  }

  const isPaid = account?.plan === 'paid'
  const activitiesThisCycle = usage?.units ?? 0
  const freeIncluded = FREE_TIER.maxActiveActivities
  const billableActivities = isPaid
    ? Math.max(0, activitiesThisCycle - freeIncluded)
    : 0
  const estimatedOverage = billableActivities * 0.01
  const freeRemaining = Math.max(0, freeIncluded - activitiesThisCycle)

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
      </section>

      <section className="surface-card mt-6 max-w-lg p-6">
        <h2 className="text-[16px] text-[var(--color-ink)]">Plan</h2>
        <p className="mt-2 text-[13px] text-[var(--color-muted)]">
          {isPaid
            ? 'Paid plan: the first 100 activities each month are free, then $0.01 per additional live activity.'
            : 'Free plan: up to 100 activities per month.'}
        </p>
        <div className="mt-4 inline-flex rounded-full border border-[color:var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-[12px] text-[var(--color-muted)]">
          Current plan: <span className="ml-1 font-medium text-[var(--color-ink)]">{isPaid ? 'Paid' : 'Free'}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {!isPaid ? (
            <a href="/api/billing/create-checkout-session" className="btn-primary">
              Upgrade to Paid
            </a>
          ) : null}
          <a href="/api/billing/portal" className="btn-ghost">
            Billing
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[color:var(--color-line)] p-4">
            <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              Activities This Cycle
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
              {activitiesThisCycle}
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-muted)]">
              Current billing month: {month}
            </p>
          </div>
          <div className="rounded-xl border border-[color:var(--color-line)] p-4">
            <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              {isPaid ? 'Estimated Overage' : 'Free Activities Remaining'}
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
              {isPaid ? `$${estimatedOverage.toFixed(2)}` : freeRemaining}
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-muted)]">
              {isPaid
                ? `${billableActivities} billable live activities this month`
                : `${freeIncluded} included each month`}
            </p>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button type="submit" className="btn-ghost">
            Log out
          </button>
        </form>
      </section>
    </div>
  )
}
