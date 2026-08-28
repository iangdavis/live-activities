import Link from 'next/link'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { CheckIcon } from './icons'

export function Pricing() {
  return (
    <section id="pricing" className="container-page py-20 sm:py-28">
      <SectionHeading title="Simple pricing.">
        Free gets you started with one project and up to 100 live activities per
        month. Paid keeps the same free allowance, then adds unlimited
        projects, detailed logs, and usage-based pricing.
      </SectionHeading>

      <Reveal delay={60} className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-[1fr_1.15fr]">
        <article className="surface-card relative overflow-hidden p-7 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-accent)]/50 to-transparent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[var(--color-accent-soft)]">
            Free
          </p>
          <h3 className="mt-3 text-[38px] font-semibold tracking-tight text-[var(--color-ink)] sm:text-[46px]">
            Free
          </h3>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
            Send up to 100 live activities per month.
          </p>

          <div className="mt-6 rounded-2xl border border-[color:var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
              Included
            </div>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]">
                <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--color-live)]" />
                <span>1 project</span>
              </li>
              <li className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]">
                <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--color-live)]" />
                <span>Detailed logs</span>
              </li>
            </ul>
          </div>

          <Link href="/signup" className="btn-ghost mt-8 w-full sm:w-auto">
            Start Free
          </Link>
        </article>

        <article className="surface-card relative overflow-hidden border-[color:var(--color-accent)]/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-7 sm:p-8">
          <div className="absolute right-6 top-6 rounded-full border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">
            Best value
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[var(--color-accent-soft)]">
            Paid
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
            <h3 className="text-[38px] font-semibold tracking-tight text-[var(--color-ink)] sm:text-[50px]">
              Paid
            </h3>
            <div className="text-[18px] font-medium text-[var(--color-ink-soft)]">
              $0.01 per live activity
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
            The first 100 live activities are free, then you only pay for what you use.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--color-line)] bg-[rgba(0,0,0,0.18)] p-4">
              <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
                Projects
              </div>
              <div className="mt-2 text-[20px] font-semibold text-[var(--color-ink)]">
                Unlimited
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-line)] bg-[rgba(0,0,0,0.18)] p-4">
              <div className="text-[12px] uppercase tracking-wide text-[var(--color-faint)]">
                Logs
              </div>
              <div className="mt-2 text-[20px] font-semibold text-[var(--color-ink)]">
                Detailed
              </div>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            <li className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]">
              <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--color-live)]" />
              <span>First 100 live activities free</span>
            </li>
            <li className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]">
              <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--color-live)]" />
              <span>Unlimited projects</span>
            </li>
            <li className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]">
              <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--color-live)]" />
              <span>Detailed logs</span>
            </li>
          </ul>

          <Link href="/signup" className="btn-primary mt-8 w-full sm:w-auto">
            Start Free
          </Link>
        </article>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-8 text-center text-[13px] text-[var(--color-faint)]">
          No credit card required for the free plan. Upgrade anytime from the
          dashboard.
        </p>
      </Reveal>
    </section>
  )
}
