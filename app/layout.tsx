import type { Metadata } from 'next'
import { JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { site } from '@/lib/config'
import { publicAppUrl } from '@/lib/env'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const appUrl = publicAppUrl()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${site.productName} - Live Activities, without the backend headache`,
    template: `%s | ${site.productName}`,
  },
  description: site.description,
  applicationName: site.productName,
  keywords: [
    'Live Activities',
    'ActivityKit',
    'APNs',
    'iOS',
    'push notifications',
    'Live Activity backend',
  ],
  authors: [{ name: site.productName }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: site.productName,
    title: `${site.productName} - Live Activity Infrastructure`,
    description:
      'One simple API to start, update, and end iOS Live Activities. We handle the APNs, tokens, lifecycle, and delivery infrastructure.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.productName} - Live Activity Infrastructure`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
}

export const viewport = {
  themeColor: '#08090c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${manrope.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
