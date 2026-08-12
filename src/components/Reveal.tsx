import type { ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type RevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Stagger delay in milliseconds. */
  delay?: number
}

export function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLElement>()

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
