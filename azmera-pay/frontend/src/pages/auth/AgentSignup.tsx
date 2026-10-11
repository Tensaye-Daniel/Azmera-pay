import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { fetchMe, login, registerAgent } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { PhoneIcon, UsersIcon } from '../../components/ui/icons'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'

const inputClasses = `w-full rounded-xl border border-forest/20 bg-white px-3 py-2.5 text-sm text-stone-dark placeholder:text-stone/60 ${focusRing}`

type FieldErrors = Record<string, string[]>

function apiFieldErrors(err: unknown): FieldErrors {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data
    if (typeof data === 'object' && data !== null) {
      const errors: FieldErrors = {}
      for (const [field, message] of Object.entries(data)) {
        if (Array.isArray(message)) {
          errors[field] = message.map(String)
        } else if (typeof message === 'string') {
          errors[field] = [message]
        }
      }
      return errors
    }
  }
  return {}
}

export default function AgentSignup() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/agent" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setGeneralError(null)
    setFieldErrors({})

    const errors: FieldErrors = {}
    if (!fullName.trim()) errors.full_name = ['Full name is required.']
    if (!phone.trim()) errors.phone = ['Phone number is required.']
    if (password.length < 8)
      errors.password = ['Password must be at least 8 characters.']
    if (confirmPassword !== password)
      errors.confirm_password = ['Passwords do not match.']

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitting(false)
      return
    }

    try {
      await registerAgent({
        full_name: fullName.trim(),
        phone: phone.trim(),
        password,
      })
      const tokens = await login(phone.trim(), password)
      setSession(tokens.access, tokens.refresh)
      const me = await fetchMe()
      setUser(me)
      navigate('/agent', { replace: true })
    } catch (err) {
      const apiErrors = apiFieldErrors(err)
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors)
      } else {
        setGeneralError(
          'Could not create your account. Please try again.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-dark/95 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-mint/60 text-forest-deeper">
            <UsersIcon className="size-7" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-forest-deeper">
            Create your agent account
          </h1>
          <p className="mt-1 text-sm text-stone">
            Register and start onboarding farmers in your area.
          </p>
        </div>

        {generalError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {generalError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="full_name"
              className="mb-1.5 block text-sm font-medium text-stone-dark"
            >
              Full name
            </label>
            <input
              id="full_name"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClasses}
            />
            {fieldErrors.full_name?.[0] && (
              <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">
                {fieldErrors.full_name.join(' ')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-stone-dark"
            >
              Phone number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone">
                <PhoneIcon className="size-5" />
              </span>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+251912345678"
                className={`rounded-xl border border-forest/20 bg-white py-2.5 pl-11 pr-3 text-sm text-stone-dark placeholder:text-stone/60 ${focusRing}`}
              />
            </div>
            {fieldErrors.phone?.[0] && (
              <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">
                {fieldErrors.phone.join(' ')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-stone-dark"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClasses}
            />
            {fieldErrors.password?.[0] ? (
              <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">
                {fieldErrors.password.join(' ')}
              </p>
            ) : (
              <p className="mt-1.5 text-xs leading-5 text-stone">
                At least 8 characters.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="mb-1.5 block text-sm font-medium text-stone-dark"
            >
              Confirm password
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClasses}
            />
            {fieldErrors.confirm_password?.[0] && (
              <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">
                {fieldErrors.confirm_password.join(' ')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-forest transition-colors hover:text-forest-dark"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}