import type { ComponentType, SVGProps } from 'react'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import {
  ApnsIcon,
  TokenIcon,
  LifecycleIcon,
  DeliveryIcon,
  ObservabilityIcon,
  ConstraintsIcon,
} from './icons'

type Feature = {
  title: string
  body: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const FEATURES: Feature[] = [
  {
    title: 'APNs',
    body: 'Push delivery infrastructure built specifically for Live Activities.',
    Icon: ApnsIcon,
  },
  {
    title: 'Tokens',
    body: 'Manage Live Activity push tokens without building the plumbing yourself.',
    Icon: TokenIcon,
  },
  {
    title: 'Lifecycle',
    body: 'Start, update, expire, and end activities reliably.',
    Icon: LifecycleIcon,
  },
  {
    title: 'Delivery',
    body: 'Retries, deduplication, and sensible update handling.',
    Icon: DeliveryIcon,
  },
  {
    title: 'Observability',
    body: 'See what happened when an update doesn\u2019t arrive.',
    Icon: ObservabilityIcon,
  },
  {
    title: 'Apple Constraints',
    body: 'Build around the realities of ActivityKit and iOS delivery.',
    Icon: ConstraintsIcon,
  },
]

export function Infrastructure() {
  return (
    <section id="infrastructure" className="container-page py-20 sm:py-28">
      <SectionHeading eyebrow="What we handle" title="We handle the annoying parts." />

      <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ title, body, Icon }, i) => (
          <Reveal
            key={title}
            delay={(i % 3) * 70}
            className="group bg-[color:var(--color-surface)] p-6 transition-colors duration-300 hover:bg-[color:var(--color-surface-2)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-[color:var(--color-line-strong)] bg-white/[0.03] text-[var(--color-accent-soft)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
              <Icon />
            </span>
            <h3 className="mt-4 text-[17px] font-semibold">{title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-muted)]">
              {body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
