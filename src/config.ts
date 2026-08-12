// Central product configuration. Change these values to rebrand or wire up
// real destinations later.

export const config = {
  productName: 'ActivityKit Cloud',
  tagline: 'Live Activities, without the backend headache.',
  // Set to real URLs when they exist. Empty string => link is omitted.
  links: {
    github: '',
    x: '',
    contact: 'mailto:hello@example.com',
  },
  // Where the waitlist form should POST when a real endpoint is available.
  // Leave empty to use the local mock submission handler.
  waitlistEndpoint: '',
} as const

export type SiteConfig = typeof config
