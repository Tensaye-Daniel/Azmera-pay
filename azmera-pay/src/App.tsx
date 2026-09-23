import About from './components/About'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Navbar from './components/Navbar'
import SupplierSection from './components/SupplierSection'
import TrustSection from './components/TrustSection'

function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-warmwhite"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <HowItWorks />
        <SupplierSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

export default App