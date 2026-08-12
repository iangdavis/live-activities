import { Reveal } from './Reveal'

export function WhyThisExists() {
  return (
    <section className="container-page py-20 sm:py-28">
      <Reveal className="mx-auto max-w-3xl">
        <div
          className="surface-card relative overflow-hidden p-8 text-center sm:p-14"
          style={{ background: 'var(--color-surface)' }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
            }}
          />
          <span className="eyebrow">Why this exists</span>
          <h2 className="mt-3 text-[28px] leading-tight sm:text-[36px]">
            One thing. Done well.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--color-muted)] sm:text-[17px]">
            Existing platforms bundle Live Activities into broader messaging and
            customer-engagement products. This is different.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-soft)] sm:text-[17px]">
            We&rsquo;re building infrastructure specifically for developers who
            just want Live Activities to work.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
