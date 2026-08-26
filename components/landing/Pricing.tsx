import Link from 'next/link'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { CheckIcon } from './icons'
import { PLANS } from '@/lib/config'

export function Pricing() {
  return (
    <section id="pricing" className="container-page py-20 sm:py-28">
      <SectionHeading title="Simple pricing.">
        Start free for up to 100 activities each month. After that, pay
        $0.01 per live activity.
      </SectionHeading>

      <Reveal delay={60} className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`surface-card relative flex flex-col p-7 ${
              'featured' in plan && plan.featured
                ? 'ring-1 ring-[color:var(--color-accent)]/30'
                : ''
            }`}
          >
            {'featured' in plan && plan.featured && (
              <span className="absolute right-6 top-6 rounded-full border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent-soft)]">
                Popular
              </span>
            )}
            <h3 className="text-[15px] font-semibold text-[var(--color-ink-soft)]">
              {plan.name}
            </h3>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[40px] font-semibold tracking-tight text-[var(--color-ink)]">
                {plan.price}
              </span>
              <span className="text-[14px] text-[var(--color-faint)]">
                {plan.cadence}
              </span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]"
                >
                  <CheckIcon
                    width={18}
                    height={18}
                    className="mt-0.5 shrink-0 text-[var(--color-live)]"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`mt-8 ${
                'featured' in plan && plan.featured ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              Start Free
            </Link>
          </div>
        ))}
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
