import { Reveal } from './Reveal'

export function Problem() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-[28px] leading-tight sm:text-[36px]">
            Live Activities are great. Building them isn&rsquo;t.
          </h2>
        </Reveal>

        <Reveal delay={80} className="mt-8">
          <div className="flex flex-wrap gap-2">
            {[
              'ActivityKit',
              'APNs',
              'Push tokens',
              'Activity lifecycle',
              'Update delivery',
              'Apple\u2019s constraints',
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-[color:var(--color-line)] bg-white/[0.02] px-3 py-1.5 font-mono text-[13px] text-[var(--color-ink-soft)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-8 text-[17px] leading-relaxed text-[var(--color-ink-soft)] sm:text-[19px]">
            You shouldn&rsquo;t have to build an entire notification
            infrastructure just to put useful information on the Lock Screen and
            Dynamic Island.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
