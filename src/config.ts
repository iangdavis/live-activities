// Central product configuration. Change these values to rebrand or wire up
// real destinations later.

// Where waitlist signups and contact should go.
const contactEmail = 'iandavis2@me.com'

export const config = {
  productName: 'Live Hive',
  tagline: 'Live Activities, without the backend headache.',
  contactEmail,
  // Set to real URLs when they exist. Empty string => link is omitted.
  links: {
    github: '',
    x: '',
    contact: `mailto:${contactEmail}`,
  },
  // Waitlist submissions are emailed via FormSubmit (https://formsubmit.co),
  // a no-backend form-to-email service. In production the modal performs a
  // native HTML form POST to this URL, which forwards the submission to the
  // address above and then redirects back to the site (?waitlist=success).
  //
  // IMPORTANT: FormSubmit requires a one-time activation. The very first
  // submission sends a confirmation email to the address; click its link once
  // and every future submission is delivered (and redirects smoothly).
  //
  // To use your own backend instead, change this to your endpoint or clear it.
  waitlistFormAction: `https://formsubmit.co/${contactEmail}`,
  // Optional JSON endpoint for a future custom backend. When set, the local
  // mock handler in submitWaitlist() will POST { email } here instead. Empty
  // => the mock simply simulates success (used in local dev).
  waitlistEndpoint: '',
} as const

export type SiteConfig = typeof config
