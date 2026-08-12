import type { ElementType, ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Kept for API compatibility; no longer used (scroll reveal removed). */
  delay?: number
}

/**
 * Previously animated content into view on scroll. That effect was removed by
 * preference, so this is now a plain layout wrapper that simply renders its
 * children (keeping existing call sites and layout classes intact).
 */
export function Reveal({ children, as: Tag = 'div', className = '' }: RevealProps) {
  return <Tag className={className}>{children}</Tag>
}
