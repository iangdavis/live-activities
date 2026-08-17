import Link from 'next/link'
import { Reveal } from './Reveal'
import { ArrowRightIcon } from './icons'

export function FinalCTA() {
  return (
    <section className="container-page py-20 sm:py-28">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-[24px] border border-[color:var(--color-line-strong)] px-6 py-16 text-center sm:px-10 sm:py-20"
          style={{
            background:
              'radial-gradient(80% 120% at 50% 0%, rgba(255,255,255,0.06), transparent 60%), var(--color-surface)',
          }}
        >
          <h2 className="mx-auto max-w-2xl text-[30px] leading-tight sm:text-[42px]">
            Build your next Live Activity in minutes.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-[var(--color-muted)] sm:text-[18px]">
            Create a project, drop in the iOS SDK, and POST your first update.
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
            <Link href="/docs" className="btn-ghost">
              Read the Docs
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
