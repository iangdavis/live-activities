import { WaitlistProvider } from './components/WaitlistProvider'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { ApiExample } from './components/ApiExample'
import { Infrastructure } from './components/Infrastructure'
import { WhyThisExists } from './components/WhyThisExists'
import { Pricing } from './components/Pricing'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

function App() {
  return (
    <WaitlistProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <Problem />
          <ApiExample />
          <Infrastructure />
          <WhyThisExists />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </WaitlistProvider>
  )
}

export default App
