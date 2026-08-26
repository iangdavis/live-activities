import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import Link from 'next/link'

export default async function PaymentsPage() {
  const session = await getSession()
  if (!session) return null
  const account = await prisma.account.findUnique({ where: { id: session.accountId }, select: { plan: true, stripeSubscriptionId: true, stripeCustomerId: true } })
  const payments = await prisma.payment.findMany({ where: { accountId: session.accountId }, orderBy: { createdAt: 'desc' }, take: 50 })
  const isPaid = account?.plan === 'paid'

  return (
    <div>
      <h1 className="text-[20px]">Payments</h1>
      <p className="mt-2 text-[13px] text-[var(--color-muted)]">
        {isPaid
          ? 'Paid plan: the first 100 activities each month are free, then $0.01 per additional activity.'
          : 'Free plan: up to 100 activities per month.'}
      </p>
      <div className="mt-4 inline-flex rounded-full border border-[color:var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-[12px] text-[var(--color-muted)]">
        Current plan: <span className="ml-1 font-medium text-[var(--color-ink)]">{isPaid ? 'Paid' : 'Free'}</span>
      </div>
      <div className="mt-4 flex gap-3">
        {!isPaid ? (
          <form action="/api/billing/create-checkout-session" method="POST">
            <button className="btn-primary">Upgrade to Paid</button>
          </form>
        ) : null}
        <form action="/api/billing/portal" method="POST">
          <button className="btn-ghost">{isPaid ? 'Downgrade to Free' : 'Manage billing'}</button>
        </form>
      </div>

      <h2 className="mt-8 text-[16px]">Recent payments</h2>
      <div className="mt-3">
        {payments.length === 0 ? (
          <p className="text-[13px] text-[var(--color-muted)]">No payments recorded yet.</p>
        ) : (
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              <tr>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Provider</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-[color:var(--color-line)]">
                  <td className="py-3 text-[13px] text-[var(--color-muted)]">{p.createdAt.toISOString()}</td>
                  <td className="py-3">${(p.amountCents / 100).toFixed(2)}</td>
                  <td className="py-3">{p.status}</td>
                  <td className="py-3">{p.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
