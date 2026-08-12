import { useWaitlist } from './waitlist-context'
import { LiveActivityPreview } from './LiveActivityPreview'
import { ArrowRightIcon } from './icons'

export function Hero() {
  const { open } = useWaitlist()

  return (
    <section id="top" className="bg-ambient relative overflow-hidden">
      <div className="container-page relative pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="reveal is-visible inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line-strong)] bg-white/[0.03] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-live)]" />
            <span className="eyebrow !text-[11px] !text-[var(--color-ink-soft)]">
              Live Activity Infrastructure
            </span>
          </div>

          <h1 className="mt-6 text-[40px] leading-[1.05] sm:text-[58px] sm:leading-[1.03]">
            Live Activities, without
            <br className="hidden sm:block" /> the backend headache.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--color-muted)] sm:text-[18px]">
            One simple API to start, update, and end iOS Live Activities. We
            handle the APNs, tokens, lifecycle, and delivery infrastructure.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button type="button" onClick={open} className="btn-primary group">
              Join the waitlist
              <ArrowRightIcon
                width={16}
                height={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
            <p className="text-[13px] text-[var(--color-faint)]">
              Built for developers. No enterprise sales pitch.
            </p>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <LiveActivityPreview />
        </div>
      </div>

      {/* Fade the ambient grid into the page */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-canvas))',
        }}
      />
    </section>
  )
}
