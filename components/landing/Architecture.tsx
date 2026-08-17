import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const STEPS = [
  { from: 'iOS SDK', to: 'Live Hive register' },
  { from: 'Your backend', to: 'Live Hive update / end' },
  { from: 'Live Hive', to: 'APNs' },
  { from: 'APNs', to: 'iPhone Live Activity' },
]

export function Architecture() {
  return (
    <section id="how-it-works" className="container-page py-20 sm:py-28">
      <SectionHeading title="How it works.">
        You keep ActivityKit and your product logic. The iOS SDK registers the
        token. Your backend talks HTTP.
      </SectionHeading>

      <Reveal className="mx-auto mt-12 max-w-2xl">
        <div className="surface-card overflow-hidden">
          {STEPS.map((step, i) => (
            <div
              key={step.from}
              className={`flex items-center gap-4 px-6 py-4 ${
                i < STEPS.length - 1 ? 'border-b border-[color:var(--color-line)]' : ''
              }`}
            >
              <span className="font-mono text-[12px] text-[var(--color-faint)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[15px] text-[var(--color-ink-soft)]">
                <span className="text-[var(--color-ink)]">{step.from}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="1.6">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
                <span>{step.to}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[14px] text-[var(--color-muted)]">
          The iOS SDK registers the push token. Your backend never sees it.
        </p>
      </Reveal>
    </section>
  )
}
