import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { submitWaitlist } from '../lib/submitWaitlist'
import { CheckIcon } from './icons'

type WaitlistModalProps = {
  isOpen: boolean
  onClose: () => void
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state shortly after close and focus input on open.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setEmail('')
      setStatus('idle')
      setError('')
    }, 250)
    return () => clearTimeout(t)
  }, [isOpen])

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setError('')
    const result = await submitWaitlist(email)
    if (result.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      />
      <div
        className="surface-card relative z-10 m-3 w-full max-w-md p-6 sm:p-7 shadow-2xl animate-[modalIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md text-[var(--color-faint)] transition-colors hover:bg-white/5 hover:text-[var(--color-ink)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full border border-[color:var(--color-live)]/30 bg-[color:var(--color-live)]/10 text-[var(--color-live)]">
              <CheckIcon width={24} height={24} />
            </div>
            <h3 id="waitlist-title" className="text-xl font-semibold">
              You&rsquo;re on the list.
            </h3>
            <p className="mt-2 text-[15px] text-[var(--color-muted)]">
              We&rsquo;ll be in touch.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost mt-6 w-full"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 id="waitlist-title" className="text-xl font-semibold">
              Join the waitlist
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">
              Be one of the first developers to try {config.productName}. No
              spam, just a note when it&rsquo;s ready.
            </p>

            <form onSubmit={handleSubmit} className="mt-5" noValidate>
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                ref={inputRef}
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') {
                    setStatus('idle')
                    setError('')
                  }
                }}
                className="w-full rounded-[10px] border border-[color:var(--color-line-strong)] bg-black/30 px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[color:var(--color-accent)]/70 focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
                aria-invalid={status === 'error'}
              />
              {error && (
                <p className="mt-2 text-[13px] text-red-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'submitting' ? 'Joining\u2026' : 'Join the waitlist'}
              </button>
            </form>
            <p className="mt-3 text-center text-[12px] text-[var(--color-faint)]">
              Built for developers. No enterprise sales pitch.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
