import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { CheckIcon } from './icons'
import { useWaitlist } from './waitlist-context'

type Plan = {
  name: string
  price: string
  cadence: string
  features: string[]
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: '/ month',
    features: [
      '1 project',
      '1,000 active activities',
      '10,000 updates / month',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    cadence: '/ month',
    featured: true,
    features: [
      'Unlimited projects',
      '50,000 active activities',
      '1,000,000 updates / month',
      'Delivery logs',
      'Email support',
    ],
  },
]

export function Pricing() {
  const { open } = useWaitlist()

  return (
    <section id="pricing" className="container-page py-20 sm:py-28">
      <SectionHeading title="Simple pricing.">
        The plans we intend to launch with. Join the waitlist to get early
        access.
      </SectionHeading>

      <Reveal delay={60} className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`surface-card relative flex flex-col p-7 ${
              plan.featured ? 'ring-1 ring-[color:var(--color-accent)]/30' : ''
            }`}
          >
            {plan.featured && (
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
                <li key={f} className="flex items-start gap-3 text-[14.5px] text-[var(--color-ink-soft)]">
                  <CheckIcon
                    width={18}
                    height={18}
                    className="mt-0.5 shrink-0 text-[var(--color-live)]"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={open}
              className={`mt-8 ${plan.featured ? 'btn-primary' : 'btn-ghost'}`}
            >
              Join the waitlist
            </button>
          </div>
        ))}
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-8 text-center text-[13px] text-[var(--color-faint)]">
          Pricing is subject to change during early access.
        </p>
      </Reveal>
    </section>
  )
}
