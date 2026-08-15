/**
 * Compact mark: a rounded "capsule" nodding to the Dynamic Island / Live
 * Activity pill, with a live indicator dot.
 */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-[8px] border border-[color:var(--color-line-strong)]"
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
      }}
      aria-hidden="true"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8.5" width="16" height="7" rx="3.5" fill="rgba(255,255,255,0.14)" />
        <circle cx="8.5" cy="12" r="2" fill="var(--color-live)" />
        <rect x="12" y="11" width="6" height="2" rx="1" fill="rgba(255,255,255,0.55)" />
      </svg>
    </span>
  )
}
