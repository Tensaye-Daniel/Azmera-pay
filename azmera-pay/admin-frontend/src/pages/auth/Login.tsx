import { useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchMe, login } from '../../api/auth'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Notice from '../../components/ui/Notice'
import PasswordInput from '../../components/ui/PasswordInput'
import TextInput from '../../components/ui/TextInput'
import { LockIcon, PhoneIcon } from '../../components/ui/icons'
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
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4'>
      <div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg'>
        <header className='mb-6 text-center'>
          <h1 className='text-xl font-semibold text-slate-900'>Azmera Admin</h1>
          <p className='mt-1 text-sm text-slate-600'>Sign in to the admin dashboard</p>
        </header>
        {error && <Notice variant='error' className='mb-6'>{error}</Notice>}
        <form onSubmit={handleSubmit} className='space-y-5' noValidate>
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
          <Button type='submit' fullWidth loading={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</Button>
        </form>
      </div>
    </div>
  )
}