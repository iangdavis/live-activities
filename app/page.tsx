import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ApiExample } from '@/components/landing/ApiExample'
import { Problem } from '@/components/landing/Problem'
import { Architecture } from '@/components/landing/Architecture'
import { Infrastructure } from '@/components/landing/Infrastructure'
import { WhyThisExists } from '@/components/landing/WhyThisExists'
import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { TrackPage } from '@/components/TrackPage'
import { JsonLd } from '@/components/JsonLd'
import { site } from '@/lib/config'
import { EVENTS } from '@/lib/analytics'
import { publicAppUrl } from '@/lib/env'

export default function HomePage() {
  const appUrl = publicAppUrl()

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: site.productName,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'iOS',
          url: appUrl,
          description: site.description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <TrackPage name={EVENTS.LANDING_PAGE_VISIT} path="/" />
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <ApiExample />
          <Problem />
          <Architecture />
          <Infrastructure />
          <WhyThisExists />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  )
}
