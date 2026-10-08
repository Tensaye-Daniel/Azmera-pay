import About from '../../components/landing/About'
import AgentSection from '../../components/landing/AgentSection'
import BuyerSection from '../../components/landing/BuyerSection'
import CTASection from '../../components/landing/CTASection'
import Hero from '../../components/landing/Hero'
import HowItWorks from '../../components/landing/HowItWorks'
import SupplierSection from '../../components/landing/SupplierSection'
import TrustSection from '../../components/landing/TrustSection'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <About />
      <HowItWorks />
      <BuyerSection />
      <SupplierSection />
      <AgentSection />
      <TrustSection />
      <CTASection />
    </>
  )
}
