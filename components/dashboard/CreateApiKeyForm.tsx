'use client'

import { useState } from 'react'
import { createApiKeyAction } from '@/app/dashboard/actions'

export function CreateApiKeyForm({ projectId }: { projectId: string }) {
  const [plaintext, setPlaintext] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createApiKeyAction(formData)
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setPlaintext(result.plaintext ?? null)
  }

  return (
    <div className="surface-card p-5">
      <h2 className="text-[16px] text-[var(--color-ink)]">Create API key</h2>
      <form action={onSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="projectId" value={projectId} />
        <input
          name="name"
          className="field"
          placeholder="Production"
          defaultValue="Default"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? 'Creating…' : 'Create key'}
        </button>
      </form>
      {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}
      {plaintext && (
        <div className="mt-4 rounded-lg border border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/10 p-4">
          <p className="text-[13px] text-[var(--color-accent-soft)]">
            Copy this key now. It will not be shown again.
          </p>
          <code className="mt-2 block break-all font-mono text-[13px] text-[var(--color-ink)]">
            {plaintext}
          </code>
        </div>
      )}
    </div>
  )
}
