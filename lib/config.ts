export const site = {
  productName: 'Live Hive',
  tagline: 'Live Activities, without the backend headache.',
  description:
    'One simple API to start, update, and end iOS Live Activities. We handle the APNs, tokens, lifecycle, and delivery infrastructure.',
  contactEmail: 'iandavis2@me.com',
  links: {
    github: '',
    x: '',
    contact: 'mailto:iandavis2@me.com',
  },
} as const

export const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: '/ month',
    features: [
      '1 project',
      '1,000 active activities',
      '10,000 updates / month',
      'Basic delivery logs',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    cadence: '/ month',
    featured: true,
    features: [
      'Unlimited projects',
      '50,000 active activities',
      '1,000,000 updates / month',
      'Delivery logs',
      'Email support',
    ],
  },
] as const
