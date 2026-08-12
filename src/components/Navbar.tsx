import { useEffect, useState } from 'react'
import { config } from '../config'
import { useWaitlist } from './waitlist-context'
import { Logo } from './Logo'

export function Navbar() {
  const { open } = useWaitlist()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-[color:var(--color-line)] bg-[color:var(--color-canvas)]/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label={config.productName}>
          <Logo />
          <span className="font-display text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
            {config.productName}
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#api"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            API
          </a>
          <a
            href="#infrastructure"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Infrastructure
          </a>
          <a
            href="#pricing"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Pricing
          </a>
        </div>

        <button type="button" onClick={open} className="btn-primary !px-4 !py-2 text-[14px]">
          Join the waitlist
        </button>
      </nav>
    </header>
  )
}
