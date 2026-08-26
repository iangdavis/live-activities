export const site = {
  productName: 'Live Hive',
  tagline: 'Live Activities, without the backend headache.',
  description:
    'An iOS SDK to start a Live Activity. Send a test update from the dashboard. Your backend takes over HTTP when you are ready.',
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
      '100 activities / month',
      'Basic delivery logs',
    ],
  },
  {
    name: 'Paid',
    price: '$0.01',
    cadence: '/ month',
    featured: true,
    features: [
      'Unlimited projects',
      'First 100 activities free',
      'Then pay per activity',
      'Delivery logs',
    ],
  },
] as const
