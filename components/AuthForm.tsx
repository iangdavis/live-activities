'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await fetch(`/api/auth?action=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })
      const data = (await res.json()) as {
        error?: { message?: string }
      }
      if (!res.ok) {
        setError(data.error?.message || 'Something went wrong.')
        return
      }
      router.push(next)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-[13px] text-[var(--color-muted)]">
            Name
          </label>
          <input
            id="name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Ada Lovelace"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] text-[var(--color-muted)]">
          Email
        </label>
        <input
          id="email"
          className="field"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] text-[var(--color-muted)]">
          Password
        </label>
        <input
          id="password"
          className="field"
          type="password"
          required
          minLength={mode === 'signup' ? 8 : 1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
      </div>
      {error && <p className="text-[13px] text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary mt-2 w-full disabled:opacity-70">
        {pending ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
      </button>
    </form>
  )
}
