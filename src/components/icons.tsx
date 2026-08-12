import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ApnsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c-2 2-3 4.5-3 7a3 3 0 0 0 6 0c0-2.5-1-5-3-7Z" />
      <path d="M5.5 13.5c-.7 2 .1 4.3 2 5.4 1 .6 2.2.8 3.3.6" />
      <path d="M18.5 13.5c.7 2-.1 4.3-2 5.4" />
      <circle cx="12" cy="10.5" r="1" />
    </svg>
  )
}

export function TokenIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="12" r="3.2" />
      <path d="M11 12h9" />
      <path d="M16.5 12v3" />
      <path d="M20 12v2.4" />
    </svg>
  )
}

export function LifecycleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2" />
      <path d="M17.5 3.5V7h-3.5" />
      <path d="M6.5 20.5V17H10" />
    </svg>
  )
}

export function DeliveryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4 12 16-7-6.5 15-2.8-5.7L4 12Z" />
      <path d="m10.7 13.3 2.8-2.8" />
    </svg>
  )
}

export function ObservabilityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

export function ConstraintsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7.5 3.2v5c0 4.4-3.1 7.7-7.5 9.3-4.4-1.6-7.5-4.9-7.5-9.3v-5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.7a10.3 10.3 0 0 0-3.26 20.07c.52.1.7-.22.7-.49v-1.9c-2.86.62-3.46-1.22-3.46-1.22-.47-1.19-1.15-1.5-1.15-1.5-.94-.64.07-.63.07-.63 1.04.08 1.58 1.07 1.58 1.07.92 1.58 2.42 1.12 3.01.86.09-.67.36-1.12.65-1.38-2.28-.26-4.68-1.14-4.68-5.08 0-1.12.4-2.04 1.06-2.76-.1-.26-.46-1.3.1-2.72 0 0 .87-.28 2.85 1.06a9.9 9.9 0 0 1 5.19 0c1.98-1.34 2.85-1.06 2.85-1.06.56 1.42.2 2.46.1 2.72.66.72 1.06 1.64 1.06 2.76 0 3.95-2.41 4.82-4.7 5.07.37.32.7.95.7 1.92v2.85c0 .27.18.6.71.49A10.3 10.3 0 0 0 12 1.7Z" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.5 3h3.2l-7 8 8.2 10.9h-6.4l-5-6.6-5.8 6.6H1.5l7.5-8.6L1 3h6.6l4.5 6 5.4-6Zm-1.1 16.9h1.8L7.7 4.9H5.8l10.6 15Z" />
    </svg>
  )
}
