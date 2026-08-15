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

type Layout = 'wide' | 'compact' | 'banner'

type Feature = {
  title: string
  body: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  layout: Layout
  span: string
}

const FEATURES: Feature[] = [
  {
    title: 'APNs',
    body: 'Push delivery infrastructure built specifically for Live Activities, so you are not maintaining your own notification stack.',
    Icon: ApnsIcon,
    layout: 'wide',
    span: 'lg:col-span-3',
  },
  {
    title: 'Tokens',
    body: 'Manage Live Activity push tokens without building the plumbing yourself.',
    Icon: TokenIcon,
    layout: 'wide',
    span: 'lg:col-span-3',
  },
  {
    title: 'Lifecycle',
    body: 'Start, update, expire, and end activities reliably.',
    Icon: LifecycleIcon,
    layout: 'compact',
    span: 'lg:col-span-2',
  },
  {
    title: 'Delivery',
    body: 'Retries, deduplication, and sensible update handling.',
    Icon: DeliveryIcon,
    layout: 'compact',
    span: 'lg:col-span-2',
  },
  {
    title: 'Observability',
    body: 'See what happened when an update doesn\u2019t arrive.',
    Icon: ObservabilityIcon,
    layout: 'compact',
    span: 'lg:col-span-2',
  },
  {
    title: 'Apple Constraints',
    body: 'Build around the realities of ActivityKit and iOS delivery.',
    Icon: ConstraintsIcon,
    layout: 'banner',
    span: 'sm:col-span-2 lg:col-span-6',
  },
]

const iconChip =
  'grid place-items-center rounded-[10px] border border-[color:var(--color-line-strong)] bg-white/[0.03] text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:border-[color:var(--color-accent)]/40 group-hover:text-[var(--color-accent)]'

function FeatureCard({ title, body, Icon, layout, span }: Feature) {
  const cellBase =
    'group bg-[color:var(--color-surface)] transition-colors duration-300 hover:bg-[color:var(--color-surface-2)]'

  if (layout === 'banner') {
    return (
      <div className={`${cellBase} ${span} flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:gap-6`}>
        <div className="flex items-center gap-4">
          <span className={`${iconChip} h-11 w-11 shrink-0`}>
            <Icon />
          </span>
          <h3 className="text-[18px] font-semibold sm:text-[19px]">{title}</h3>
        </div>
        <p className="text-[14.5px] leading-relaxed text-[var(--color-muted)] sm:max-w-md sm:border-l sm:border-[color:var(--color-line)] sm:pl-6">
          {body}
        </p>
      </div>
    )
  }

  const isWide = layout === 'wide'
  return (
    <div className={`${cellBase} ${span} ${isWide ? 'p-7' : 'p-6'}`}>
      <span className={`${iconChip} ${isWide ? 'h-11 w-11' : 'h-10 w-10'}`}>
        <Icon />
      </span>
      <h3 className={`mt-4 font-semibold ${isWide ? 'text-[19px]' : 'text-[17px]'}`}>
        {title}
      </h3>
      <p
        className={`mt-2 leading-relaxed text-[var(--color-muted)] ${
          isWide ? 'text-[15px] sm:max-w-sm' : 'text-[14.5px]'
        }`}
      >
        {body}
      </p>
    </div>
  )
}

export function Infrastructure() {
  return (
    <section id="infrastructure" className="container-page py-20 sm:py-28">
      <SectionHeading title="We handle the annoying parts." />

      <Reveal
        delay={60}
        className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-6"
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </Reveal>
    </section>
  )
}
