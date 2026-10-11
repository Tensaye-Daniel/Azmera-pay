import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchMe, login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { PhoneIcon, SproutIcon } from '../../components/ui/icons'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'

interface LocationState {
  from?: { pathname?: string }
}

export default function AgentLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
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
    setSubmitting(true)
    setError(null)
    try {
      const tokens = await login(phone, password)
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
    <div className="flex min-h-screen items-center justify-center bg-stone-dark/95 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-mint/60 text-forest-deeper">
            <SproutIcon className="size-7" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-forest-deeper">
            Agent sign in
          </h1>
          <p className="mt-1 text-sm text-stone">
            Access your farmer registration workspace.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                className={`w-full rounded-xl border border-forest/20 bg-white py-2.5 pl-11 pr-3 text-sm text-stone-dark placeholder:text-stone/60 ${focusRing}`}
              />
            </div>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`w-full rounded-xl border border-forest/20 bg-white px-3 py-2.5 text-sm text-stone-dark placeholder:text-stone/60 ${focusRing}`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 rounded-xl bg-[#f7faf6] px-4 py-3 text-xs leading-5 text-stone">
          Demo agent: <span className="font-medium">+251911000001</span> /{' '}
          <span className="font-medium">demo-pass-123</span>
        </p>
      </div>
    </div>
  )
}