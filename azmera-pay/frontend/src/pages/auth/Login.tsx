import { useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchMe, login } from '../../api/auth'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import ScrollToTop from '../../components/layout/ScrollToTop'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Notice from '../../components/ui/Notice'
import PasswordInput from '../../components/ui/PasswordInput'
import TextInput from '../../components/ui/TextInput'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
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

const PHONE_DIGITS = /^\d{9,12}$/

type LoginVariant = 'agent' | 'supplier'

const homePathFor = (role: string): string => {
  if (role === 'supplier') return '/supplier'
  return '/agent'
}

function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('251')) digits = `251${digits}`
  return `+${digits}`
}

export default function Login({ variant = 'agent' }: { variant?: LoginVariant }) {
  const { t } = useTranslation()

  const copy = {
    agent: {
      heroDescription: t('auth.welcomeSubtextAgent'),
      cardDescription: t('auth.cardDescAgent'),
      registerPath: '/register/agent',
    },
    supplier: {
      heroDescription: t('auth.welcomeSubtextSupplier'),
      cardDescription: t('auth.cardDescSupplier'),
      registerPath: '/register/supplier',
    },
  }[variant]
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
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />
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
    } else if (!PHONE_DIGITS.test(value.replace(/\D/g, ''))) {
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
      const tokens = await login(normalizePhone(value), password)
      setSession(tokens.access, tokens.refresh, remember)
      const me = await fetchMe()
      if (me.role === 'admin') {
        logout()
        setError(
          'Administrator accounts must sign in through the separate Azmera admin portal.',
        )
        return
      }
      setUser(me)
      const from = (location.state as LocationState | null)?.from?.pathname
      navigate(
        from && !from.startsWith('/login') ? from : homePathFor(me.role),
        { replace: true },
      )
    } catch (cause) {
      const data = cause instanceof AxiosError ? cause.response?.data as Record<string, unknown> | undefined : undefined
      const detail = data?.detail ?? data?.non_field_errors
      setError(Array.isArray(detail) ? detail.map(String).join(' ') : typeof detail === 'string' ? detail : 'Unable to sign in. Check your phone number and password and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:grid lg:grid-cols-[42%_1fr]">
      <ScrollToTop />
      <AgentSignupHero
        headline={t('auth.welcomeBackHero')}
        description={copy.heroDescription}
        imageSrc={variant === 'supplier' ? '/images/supplier2.jpg' : undefined}
        imageAlt={
          variant === 'supplier'
            ? 'Azmera supplier at a produce market'
            : undefined
        }
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
              <header className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-forest-deeper">
                    {t('auth.welcomeBack')}
                  </h2>
                  <p className="mt-1 text-sm text-stone">
                    {copy.cardDescription}
                  </p>
                </div>
                <LanguageSwitcher />
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
                  label={t('common.phone')}
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
                  label={t('common.password')}
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
                    placeholder={t('auth.passwordPlaceholder')}
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
                  {submitting ? t('auth.signingIn') : t('auth.signInButton')}
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

              {copy.registerPath && (
                <p className="mt-6 text-center text-sm text-stone">
                  {t('auth.noAccount')}{' '}
                  <Link
                    to={copy.registerPath}
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    {t('auth.registerHere')}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </main>

        <AgentSignupFooter />
      </div>
    </div>
  )
}
