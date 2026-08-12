import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

type SectionHeadingProps = {
  title: ReactNode
  children?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  title,
  children,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignment =
    align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'
  return (
    <Reveal className={`${alignment} ${className}`}>
      <h2 className="text-[28px] leading-tight sm:text-[36px]">{title}</h2>
      {children && (
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-muted)] sm:text-[17px]">
          {children}
        </p>
      )}
    </Reveal>
  )
}
