import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchMe, login } from '../../api/auth'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Notice from '../../components/ui/Notice'
import PasswordInput from '../../components/ui/PasswordInput'
import TextInput from '../../components/ui/TextInput'
import { LockIcon, PhoneIcon } from '../../components/ui/icons'
import { useAuthStore } from '../../store/auth'

interface LocationState {
  from?: { pathname?: string }
}

interface LoginErrors {
  phone?: string
  password?: string
}

export default function AgentLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()
  const location = useLocation()

  if (user) {
    return <Navigate to="/agent" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors: LoginErrors = {}
    if (!phone.trim()) nextErrors.phone = 'Phone number is required.'
    if (!password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    setError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const tokens = await login(phone.trim(), password)
      setSession(tokens.access, tokens.refresh)
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
      <AgentSignupHero
        headline="Welcome back to Azmera"
        description="Sign in to keep supporting Ethiopian farmers and connect them with better agricultural opportunities."
      />

      <div className="flex flex-1 flex-col lg:min-h-screen">
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-xl">
            <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.10)] sm:p-8">
              <header className="mb-6">
                <h2 className="font-serif text-2xl font-semibold text-forest-deeper">
                  Agent sign in
                </h2>
                <p className="mt-1 text-sm text-stone">
                  Access your farmer registration workspace.
                </p>
              </header>

              {error && (
                <Notice variant="error" className="mb-6">
                  {error}
                </Notice>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Field
                  id="phone"
                  label="Phone number"
                  required
                  error={errors.phone}
                  hint="Ethiopian number with +251 country code."
                >
                  <TextInput
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value)
                      setErrors((prev) => ({ ...prev, phone: undefined }))
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

                <Button type="submit" fullWidth loading={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-stone">
                New to Azmera?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-forest underline-offset-2 hover:underline"
                >
                  Create an agent account
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
