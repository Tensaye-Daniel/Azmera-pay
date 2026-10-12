import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchMe, login } from '../../api/auth'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import ScrollToTop from '../../components/layout/ScrollToTop'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Notice from '../../components/ui/Notice'
import PasswordInput from '../../components/ui/PasswordInput'
import TextInput from '../../components/ui/TextInput'
import {
  FaydaIcon,
  LockIcon,
  PhoneIcon,
} from '../../components/ui/icons'
import { useAuthStore } from '../../store/auth'

interface LocationState {
  from?: { pathname?: string }
}

interface LoginErrors {
  identifier?: string
  password?: string
}

const PHONE_PATTERN = /^(?:\+251|0)?[79]\d{8}$/

export default function AgentLogin() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()
  const location = useLocation()

  if (user) {
    return <Navigate to="/agent" replace />
  }

  const showComingSoon = (message: string) => {
    setError(null)
    setInfo(message)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const value = identifier.trim()
    const nextErrors: LoginErrors = {}
    if (!value) {
      nextErrors.identifier = 'Enter your phone number or email address.'
    } else if (value.includes('@')) {
      nextErrors.identifier =
        'Email sign-in is not available yet. Please use the phone number linked to your account.'
    } else if (!PHONE_PATTERN.test(value.replace(/\s+/g, ''))) {
      nextErrors.identifier =
        'Enter a valid Ethiopian number, e.g. +251912345678.'
    }
    if (!password) nextErrors.password = 'Password is required.'

    setErrors(nextErrors)
    setError(null)
    setInfo(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const tokens = await login(value, password)
      setSession(tokens.access, tokens.refresh, remember)
      const me = await fetchMe()
      setUser(me)
      const from = (location.state as LocationState | null)?.from?.pathname
      navigate(from && from !== '/login' ? from : '/agent', { replace: true })
    } catch {
      setError(
        'Unable to sign in. Check your phone number and password and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:grid lg:grid-cols-[42%_1fr]">
      <ScrollToTop />
      <AgentSignupHero
        showOnMobile
        headline="Welcome Back to Azmera"
        description="Your work helps connect Ethiopian farmers to better opportunities. Sign in to continue making an impact."
      />

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
            <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.10)] sm:p-8">
              <header className="mb-6">
                <h2 className="font-serif text-2xl font-semibold text-forest-deeper">
                  Welcome Back
                </h2>
                <p className="mt-1 text-sm text-stone">
                  Sign in to your Azmera agent account.
                </p>
              </header>

              {error && (
                <Notice variant="error" className="mb-6">
                  {error}
                </Notice>
              )}

              {info && (
                <Notice variant="info" className="mb-6">
                  {info}
                </Notice>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Field
                  id="identifier"
                  label="Phone number or email address"
                  required
                  error={errors.identifier}
                  hint="Sign in with the phone number you registered."
                >
                  <TextInput
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value)
                      setErrors((prev) => ({ ...prev, identifier: undefined }))
                    }}
                    leadingIcon={<PhoneIcon className="size-5" />}
                    placeholder="+251912345678"
                  />
                </Field>

                <Field
                  id="password"
                  label="Password"
                  required
                  error={errors.password}
                >
                  <PasswordInput
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    leadingIcon={<LockIcon className="size-5" />}
                  />
                </Field>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-stone-dark">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="size-4 shrink-0 rounded accent-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      showComingSoon(
                        'Password reset is not available yet. Please contact your Azmera administrator to reset your password.',
                      )
                    }
                    className="text-sm font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" fullWidth loading={submitting}>
                  {submitting ? 'Signing In…' : 'Sign In'}
                </Button>
              </form>

              <div className="relative my-6 text-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-forest/10" />
                <span className="relative bg-white px-3 text-xs font-medium uppercase tracking-wide text-stone">
                  or
                </span>
              </div>

              <Button
                variant="secondary"
                fullWidth
                icon={<FaydaIcon className="size-5" />}
                onClick={() =>
                  showComingSoon(
                    'Fayda integration is coming soon. Please sign in using your account details.',
                  )
                }
              >
                Continue with Fayda
              </Button>

              <p className="mt-6 text-center text-sm text-stone">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-forest underline-offset-2 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </main>

        <AgentSignupFooter />
      </div>
    </div>
  )
}
