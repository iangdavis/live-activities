import { Reveal } from './Reveal'
import { useWaitlist } from './waitlist-context'
import { ArrowRightIcon } from './icons'

export function FinalCTA() {
  const { open } = useWaitlist()

  return (
    <section className="container-page py-20 sm:py-28">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-[24px] border border-[color:var(--color-line-strong)] px-6 py-16 text-center sm:px-10 sm:py-20"
          style={{
            background:
              'radial-gradient(80% 120% at 50% 0%, rgba(109,139,255,0.14), transparent 60%), var(--color-surface)',
          }}
        >
          <h2 className="mx-auto max-w-2xl text-[30px] leading-tight sm:text-[42px]">
            Build your next Live Activity in minutes.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-[var(--color-muted)] sm:text-[18px]">
            Join the waitlist and be one of the first developers to try it.
          </p>
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={open} className="btn-primary group">
              Join the waitlist
              <ArrowRightIcon
                width={16}
                height={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
