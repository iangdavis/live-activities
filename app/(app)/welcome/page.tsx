import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/ui'
import { getSession } from '@/lib/session'

export default async function WelcomePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div>
      <PageHeader title="Choose your plan" />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.15fr]">
        <section className="surface-card flex h-full flex-col p-6 sm:p-8">
          <div>
            <h2 className="text-[34px] font-semibold tracking-tight text-[var(--color-ink)] sm:text-[42px]">
              Free
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--color-muted)]">
              Start with 100 live activities per month, 1 project, and detailed logs.
            </p>
            <ul className="mt-6 list-disc space-y-3 pl-5 text-[14.5px] text-[var(--color-ink-soft)] marker:text-[var(--color-ink-soft)]">
              <li>Up to 100 live activities per month</li>
              <li>1 project</li>
              <li>Detailed logs</li>
            </ul>
          </div>

          <div className="mt-auto pt-10">
            <Link href="/dashboard" className="btn-primary self-start">
              Continue on Free
            </Link>
          </div>
        </section>

        <section className="surface-card flex h-full flex-col p-6 sm:p-8">
          <div>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <h2 className="text-[34px] font-semibold leading-none tracking-tight text-[var(--color-ink)] sm:text-[46px]">
                Paid
              </h2>
              <div className="pb-[0.08em] text-[18px] font-medium leading-none text-[var(--color-ink-soft)]">
                $0.01 per live activity
              </div>
            </div>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--color-muted)]">
              The first 100 live activities are free, then you only pay for what you use.
            </p>
            <ul className="mt-6 list-disc space-y-3 pl-5 text-[14.5px] text-[var(--color-ink-soft)] marker:text-[var(--color-ink-soft)]">
              <li>First 100 live activities free</li>
              <li>Unlimited projects</li>
              <li>Detailed logs</li>
            </ul>
          </div>

          <div className="mt-auto pt-10">
            <a href="/api/billing/create-checkout-session" className="btn-primary self-start">
              Choose Paid
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
