'use client'

import { useState } from 'react'

export function CopyButton({
  value,
  label = 'Copy',
}: {
  value: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="text-[13px] text-[var(--color-accent-soft)] hover:underline"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
