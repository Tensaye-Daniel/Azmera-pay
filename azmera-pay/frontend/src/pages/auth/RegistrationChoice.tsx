import { ArrowRight, BriefcaseBusiness, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import ScrollToTop from '../../components/layout/ScrollToTop'

const choices = [
  {
    title: 'Register as Agent',
    description:
      'Join the Azmera field team and help connect farmers with opportunities.',
    to: '/register/agent',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Register as Supplier',
    description:
      'Create a supplier account to set up your business and serve farmers.',
    to: '/register/supplier',
    icon: Store,
  },
]

export default function RegistrationChoice() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:grid lg:grid-cols-[42%_1fr]">
      <ScrollToTop />
      <AgentSignupHero
        showOnMobile
        headline="Join Azmera"
        description="Choose the account that fits the way you work with Ethiopia’s agriculture community."
      />
      <div className="flex flex-1 flex-col lg:min-h-screen">
        <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.12]" />
            <span className="absolute -top-16 right-[-4rem] size-72 rounded-full bg-mint blur-3xl" />
          </div>
          <section className="relative w-full max-w-2xl rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.10)] sm:p-8" aria-labelledby="registration-title">
            <header className="mb-7">
              <h2 id="registration-title" className="font-serif text-2xl font-semibold text-forest-deeper">Create your account</h2>
              <p className="mt-1 text-sm text-stone">Select how you would like to register.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {choices.map(({ title, description, to, icon: Icon }) => (
                <Link key={to} to={to} className="group flex min-h-48 flex-col rounded-2xl border border-forest/15 p-5 transition hover:border-forest/40 hover:bg-mint/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40">
                  <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-mint/40 text-forest-deeper"><Icon aria-hidden="true" className="size-5" /></span>
                  <span className="font-serif text-lg font-semibold text-forest-deeper">{title}</span>
                  <span className="mt-2 text-sm leading-6 text-stone">{description}</span>
                  <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-forest-deeper">Continue <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
            <p className="mt-7 text-center text-sm text-stone">Already have an account? <Link to="/login" className="font-semibold text-forest underline-offset-2 hover:underline">Log in</Link></p>
          </section>
        </main>
        <AgentSignupFooter />
      </div>
    </div>
  )
}
