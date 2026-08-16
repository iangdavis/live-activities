'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createApiKeyAction } from '@/app/(app)/actions'
import { CopyButton } from '@/components/dashboard/CopyButton'

export function CreateApiKeyForm({
  projectId,
  type,
  nameDefault,
  buttonLabel,
}: {
  projectId: string
  type: 'PUBLIC' | 'SECRET'
  nameDefault: string
  buttonLabel: string
}) {
  const router = useRouter()
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
    router.refresh()
  }

  const isPublic = type === 'PUBLIC'

  return (
    <div>
      <form action={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="type" value={type} />
        <input
          name="name"
          className="field"
          placeholder={nameDefault}
          defaultValue={nameDefault}
          aria-label="Key name"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? 'Creating…' : buttonLabel}
        </button>
      </form>
      {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}
      {plaintext && (
        <div className="mt-4 rounded-lg border border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/10 p-4">
          <p className="text-[13px] text-[var(--color-accent-soft)]">
            {isPublic
              ? 'Copy this iOS public key. It is safe to include in your iOS app.'
              : 'Copy this server API key now. It will not be shown again. Keep it secret — never put it in your iOS app.'}
          </p>
          <code className="mt-2 block break-all font-mono text-[13px] text-[var(--color-ink)]">
            {plaintext}
          </code>
          <div className="mt-2">
            <CopyButton value={plaintext} />
          </div>
        </div>
      )}
    </div>
  )
}
