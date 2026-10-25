import { useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchMe, login } from '../../api/auth'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Notice from '../../components/ui/Notice'
import PasswordInput from '../../components/ui/PasswordInput'
import TextInput from '../../components/ui/TextInput'
import {
  LockIcon,
  PhoneIcon,
  ShieldIcon,
  SproutIcon,
  StoreIcon,
  UsersIcon,
} from '../../components/ui/icons'
import { useAuthStore } from '../../store/auth'

interface LocationState { from?: { pathname?: string } }
interface LoginErrors { identifier?: string; password?: string }
const PHONE_DIGITS = /^\d{9,12}$/

function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('251')) digits = '251' + digits
  return '+' + digits
}

const reviewPoints = [
  { icon: SproutIcon, label: 'Verify farmer registrations' },
  { icon: StoreIcon, label: 'Approve supplier applications' },
  { icon: UsersIcon, label: 'Manage platform access' },
]

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember] = useState(true)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  if (user && user.role === 'admin') {
    return <Navigate to='/' replace />
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    const value = identifier.trim()
    const next: LoginErrors = {}
    if (!value) next.identifier = 'Enter your phone number.'
    else if (!PHONE_DIGITS.test(value.replace(/\D/g, ''))) next.identifier = 'Enter a valid Ethiopian number.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    setError(null)
    if (Object.keys(next).length > 0) return
    setSubmitting(true)
    try {
      const tokens = await login(normalizePhone(value), password)
      setSession(tokens.access, tokens.refresh, remember)
      const me = await fetchMe()
      if (me.role !== 'admin') {
        logout()
        setError('This login is only for admins.')
        return
      }
      setUser(me)
      const from = (location.state as LocationState | null)?.from?.pathname
      navigate(from && from !== '/login' ? from : '/', { replace: true })
    } catch (cause) {
      const data = cause instanceof AxiosError ? (cause.response?.data as any) : undefined
      const detail = data?.detail ?? data?.non_field_errors
      setError(Array.isArray(detail) ? detail.join(' ') : typeof detail === 'string' ? detail : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf6] px-4 py-8 sm:px-6'>
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <div className='bg-ethiopian-pattern absolute inset-0 opacity-20' />
        <span className='absolute -left-24 top-1/4 size-80 rounded-full bg-mint/70 blur-3xl' />
        <span className='absolute -right-24 bottom-0 size-96 rounded-full bg-mint/50 blur-3xl' />
      </div>

      <div className='relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-[0_30px_80px_-40px_rgba(22,95,48,0.45)] lg:grid-cols-[1fr_1.05fr]'>
        <aside className='relative hidden flex-col justify-between overflow-hidden bg-forest-deeper p-10 text-white lg:flex'>
          <div className='pointer-events-none absolute inset-0 opacity-[0.18]' aria-hidden='true'>
            <div className='bg-ethiopian-pattern absolute inset-0' />
          </div>
          <span className='absolute -right-16 top-10 size-56 rounded-full bg-gold/20 blur-3xl' aria-hidden='true' />

          <div className='relative'>
            <span className='inline-flex items-center rounded-2xl bg-white px-3 py-2 shadow-sm'>
              <img src='/images/logo.png' alt='Azmera' className='h-9 w-auto max-w-[9rem] object-contain' />
            </span>

            <p className='mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-gold'>
              Admin console
            </p>
            <h1 className='mt-3 font-serif text-3xl font-semibold leading-tight'>
              Keep the marketplace trusted.
            </h1>
            <p className='mt-3 max-w-sm text-sm leading-6 text-white/75'>
              Review registrations, check supporting documents and approve the
              farmers and suppliers who join Azmera.
            </p>

            <ul className='mt-8 space-y-3'>
              {reviewPoints.map(({ icon: Icon, label }) => (
                <li key={label} className='flex items-center gap-3 text-sm text-white/85'>
                  <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-gold'>
                    <Icon className='size-4.5' />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className='relative mt-10 flex items-center gap-2 text-xs text-white/55'>
            <ShieldIcon className='size-4' />
            Authorised Azmera staff only
          </p>
        </aside>

        <main className='p-6 sm:p-10'>
          <div className='mb-8 flex justify-center lg:hidden'>
            <img src='/images/logo.png' alt='Azmera' className='h-10 w-auto object-contain' />
          </div>

          <header>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-forest'>
              Administrator sign in
            </p>
            <h2 className='mt-2 font-serif text-2xl font-semibold text-forest-deeper sm:text-3xl'>
              Welcome back
            </h2>
            <p className='mt-2 text-sm leading-6 text-stone'>
              Use your admin phone number to open the review console.
            </p>
          </header>

          {error && <Notice variant='error' className='mt-6'>{error}</Notice>}

          <form onSubmit={handleSubmit} className='mt-7 space-y-5' noValidate>
            <Field id='identifier' label='Phone number' required error={errors.identifier}>
              <TextInput type='text' autoComplete='username' value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setErrors((p) => ({ ...p, identifier: undefined })) }}
                leadingIcon={<PhoneIcon className='size-5' />} placeholder='+251912345678' />
            </Field>
            <Field id='password' label='Password' required error={errors.password}>
              <PasswordInput autoComplete='current-password' value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
                leadingIcon={<LockIcon className='size-5' />} />
            </Field>
            <Button type='submit' fullWidth loading={submitting}>{submitting ? 'Signing in...' : 'Sign in to console'}</Button>
          </form>

          <p className='mt-7 border-t border-forest/10 pt-5 text-center text-xs leading-5 text-stone'>
            This portal is separate from the public Azmera app. Admin accounts
            cannot sign in on the farmer, agent or supplier pages.
          </p>
        </main>
      </div>
    </div>
  )
}
