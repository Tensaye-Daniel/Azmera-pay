import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import AgentSignupSuccess from '../../components/features/agent/AgentSignupSuccess'
import AgentSignupWizard from '../../components/features/agent/AgentSignupWizard'
import ScrollToTop from '../../components/layout/ScrollToTop'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { HomeIcon } from '../../components/ui/icons'
import { useAuthStore } from '../../store/auth'
import type { AgentRegistrationResult } from '../../types/agentRegistration'

export default function AgentSignup() {
  const { t } = useTranslation()
  const [result, setResult] = useState<AgentRegistrationResult | null>(null)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  if (user) {
    return <Navigate to={user.role === 'supplier' ? '/supplier' : '/agent'} replace />
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:grid lg:grid-cols-[42%_1fr]">
      <ScrollToTop />
      <AgentSignupHero />

      <div className="flex flex-1 flex-col lg:min-h-screen">
        <div className="flex items-center justify-between gap-3 p-4 sm:px-6 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-forest/10 bg-white/90 px-3.5 py-2 text-xs font-semibold text-forest-deeper shadow-sm transition-colors hover:bg-mint/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 sm:text-sm"
          >
            <HomeIcon className="size-4" />
            <span>{t('nav.backToMain')}</span>
          </Link>
          <LanguageSwitcher variant="light" />
        </div>
        <main className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.12]" />
            <span className="absolute -top-16 right-[-4rem] size-72 rounded-full bg-mint blur-3xl" />
          </div>
          <div className="relative w-full max-w-xl">
            {result ? (
              <AgentSignupSuccess
                result={result}
                onContinue={() => navigate('/login', { replace: true })}
              />
            ) : (
              <AgentSignupWizard onSuccess={setResult} />
            )}
          </div>
        </main>

        <AgentSignupFooter />
      </div>
    </div>
  )
}
