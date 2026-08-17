import Link from 'next/link'
import { LiveActivityPreview } from './LiveActivityPreview'
import { ArrowRightIcon } from './icons'

export function Hero() {
  return (
    <section id="top" className="bg-ambient relative overflow-hidden">
      <div className="container-page relative pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[40px] leading-[1.05] sm:text-[58px] sm:leading-[1.03]">
            Live Activities, without
            <br className="hidden sm:block" /> the backend headache.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--color-muted)] sm:text-[18px]">
            An iOS SDK to register Live Activities, and a Node SDK to update and
            end them. We handle APNs, tokens, lifecycle, and delivery.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary group">
              Start Free
              <ArrowRightIcon
                width={16}
                height={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <Link href="/#sdk" className="btn-ghost">
              See the SDK
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-[var(--color-faint)]">
            Built for developers. No enterprise sales pitch.
          </p>
        </div>

        <div className="mt-16 sm:mt-20">
          <LiveActivityPreview />
        </div>
      </div>

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
