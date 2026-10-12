import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import AgentSignupSuccess from '../../components/features/agent/AgentSignupSuccess'
import AgentSignupWizard from '../../components/features/agent/AgentSignupWizard'
import ScrollToTop from '../../components/layout/ScrollToTop'
import { useAuthStore } from '../../store/auth'
import type { AgentRegistrationResult } from '../../types/agentRegistration'

export default function AgentSignup() {
  const [result, setResult] = useState<AgentRegistrationResult | null>(null)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/agent" replace />
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:grid lg:grid-cols-[42%_1fr]">
      <ScrollToTop />
      <AgentSignupHero />

      <div className="flex flex-1 flex-col lg:min-h-screen">
        <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
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
