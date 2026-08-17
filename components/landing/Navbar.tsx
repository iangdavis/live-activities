'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { site } from '@/lib/config'
import { Logo } from './Logo'

export function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [authed, setAuthed] = useState(signedIn)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (signedIn) return
    void fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data: { user?: unknown }) => {
        if (data.user) setAuthed(true)
      })
      .catch(() => {})
  }, [signedIn])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-[color:var(--color-line)] bg-[color:var(--color-canvas)]/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label={site.productName}>
          <Logo />
          <span className="font-display text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
            {site.productName}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="/#sdk"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            SDK
          </a>
          <a
            href="/#infrastructure"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Infrastructure
          </a>
          <Link
            href="/pricing"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {authed ? (
            <Link href="/dashboard" className="btn-primary !px-4 !py-2 text-[14px]">
              Launch
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:inline"
              >
                Log in
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-[14px]">
                Start Free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
