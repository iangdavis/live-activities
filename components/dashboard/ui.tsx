import Link from 'next/link'

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string
  body: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="surface-card px-6 py-12 text-center">
      <h3 className="text-[18px]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-[var(--color-muted)]">{body}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'active' || status === 'sent'
      ? 'text-[var(--color-accent-soft)] bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)]/25'
      : status === 'failed'
        ? 'text-red-300 bg-red-500/10 border-red-500/25'
        : 'text-[var(--color-muted)] bg-white/[0.03] border-white/10'
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${tone}`}
    >
      {status}
    </span>
  )
}

export function PageHeader({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="text-[28px]">{title}</h1>
      {children}
    </div>
  )
}

export function Notice({
  error,
  saved,
  ok,
}: {
  error?: string
  saved?: boolean
  ok?: string
}) {
  if (error) {
    return (
      <p className="mb-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[14px] text-red-300">
        {error}
      </p>
    )
  }
  if (ok) {
    return (
      <p className="mb-4 rounded-lg border border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/10 px-3 py-2 text-[14px] text-[var(--color-accent-soft)]">
        {ok}
      </p>
    )
  }
  if (saved) {
    return (
      <p className="mb-4 rounded-lg border border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/10 px-3 py-2 text-[14px] text-[var(--color-accent-soft)]">
        Saved.
      </p>
    )
  }
  return null
}
