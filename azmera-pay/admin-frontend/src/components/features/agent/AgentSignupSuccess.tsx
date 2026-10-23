import type { AgentRegistrationResult } from '../../../types/agentRegistration'
import Button from '../../ui/Button'
import Notice from '../../ui/Notice'
import { CheckCircleIcon } from '../../ui/icons'

interface AgentSignupSuccessProps {
  result: AgentRegistrationResult
  onContinue: () => void
}

export default function AgentSignupSuccess({
  result,
  onContinue,
}: AgentSignupSuccessProps) {
  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-8 text-center shadow-[0_18px_50px_rgba(22,95,48,0.10)]">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-forest/10 text-forest">
        <CheckCircleIcon className="size-9" />
      </span>
      <h2 className="mt-5 font-serif text-2xl font-semibold text-forest-deeper">
        Account created successfully
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone">
        Welcome to Azmera,{' '}
        <span className="font-semibold text-stone-dark">
          {result.fullName}
        </span>
        . Your agent account is ready for{' '}
        <span className="font-semibold text-stone-dark">{result.phone}</span>.
      </p>

      <Notice variant="info" className="mt-6 text-left">
        Your account was created with your name, phone
        {result.email ? ', email' : ''} and password. The identity and agent
        details you provided are collected for reviewer verification and will be
        confirmed by the Azmera team.
      </Notice>

      <Button className="mt-6" fullWidth onClick={onContinue}>
        Continue to sign in
      </Button>
    </div>
  )
}
