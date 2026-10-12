import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import AgentSignupSuccess from '../../components/features/agent/AgentSignupSuccess'
import AgentSignupWizard from '../../components/features/agent/AgentSignupWizard'
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-mint/40 via-white to-mint/25">
      <div className="mx-auto grid min-h-screen max-w-7xl items-start gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8 lg:py-14">
        <AgentSignupHero />

        <div className="mx-auto w-full max-w-xl">
          {result ? (
            <AgentSignupSuccess
              result={result}
              onContinue={() => navigate('/login', { replace: true })}
            />
          ) : (
            <AgentSignupWizard onSuccess={setResult} />
          )}
        </div>
      </div>
    </div>
  )
}
