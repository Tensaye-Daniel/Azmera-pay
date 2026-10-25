import { AxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { registerSupplier } from '../../api/auth'
import AgentSignupFooter from '../../components/features/agent/AgentSignupFooter'
import AgentSignupHero from '../../components/features/agent/AgentSignupHero'
import ScrollToTop from '../../components/layout/ScrollToTop'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import LegalDialog from '../../components/ui/LegalDialog'
import Notice from '../../components/ui/Notice'
import PasswordInput from '../../components/ui/PasswordInput'
import TextInput from '../../components/ui/TextInput'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useAuthStore } from '../../store/auth'
import type { SupplierRegisterResult } from '../../api/auth'

type FormFields = 'fullName' | 'companyName' | 'phone' | 'tin' | 'password' | 'confirmPassword' | 'acceptedTerms'
type Errors = Partial<Record<FormFields, string>>
const PHONE_PATTERN = /^(?:\+251|0)?[79]\d{8}$/
const TIN_PATTERN = /^\d{10}$/

function apiErrors(error: unknown): { fields: Errors; general: string | null } {
  if (error instanceof AxiosError && error.response?.data && typeof error.response.data === 'object') {
    const body = error.response.data as Record<string, unknown>
    const keys: Record<string, FormFields> = {
      full_name: 'fullName', company_name: 'companyName', phone: 'phone',
      tin_number: 'tin', password: 'password',
    }
    const fields: Errors = {}
    for (const [key, value] of Object.entries(body)) {
      const field = keys[key]
      if (field) fields[field] = Array.isArray(value) ? value.map(String).join(' ') : String(value)
    }
    if (Object.keys(fields).length) return { fields, general: null }
    const message = body.detail ?? body.non_field_errors
    if (message) return { fields, general: Array.isArray(message) ? message.map(String).join(' ') : String(message) }
  }
  return { fields: {}, general: 'We could not submit your registration. Please try again.' }
}

export default function SupplierSignup() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [tin, setTin] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [result, setResult] = useState<SupplierRegisterResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={user.role === 'supplier' ? '/supplier' : '/agent'} replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: Errors = {}
    if (!fullName.trim()) next.fullName = 'Contact person name is required.'
    if (!companyName.trim()) next.companyName = 'Business name is required.'
    if (!PHONE_PATTERN.test(phone.trim().replace(/\s+/g, ''))) next.phone = 'Enter a valid Ethiopian number, e.g. +251912345678.'
    if (!TIN_PATTERN.test(tin.trim())) next.tin = 'Enter the 10-digit TIN registered to this business.'
    if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (!confirmPassword) next.confirmPassword = 'Confirm your password.'
    else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.'
    if (!acceptedTerms) next.acceptedTerms = 'Accept the Terms and Conditions to continue.'
    setErrors(next)
    setGeneralError(null)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      const created = await registerSupplier({
        full_name: fullName.trim(), phone: phone.trim(), tin_number: tin.trim(),
        company_name: companyName.trim(), password,
      })
      setResult(created)
    } catch (error) {
      const normalized = apiErrors(error)
      setErrors(normalized.fields)
      setGeneralError(normalized.general)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:grid lg:grid-cols-[42%_1fr]">
      <ScrollToTop />
      <AgentSignupHero
        headline={t('auth.supplierSignupTitle')}
        description={t('auth.supplierSignupSubtitle')}
      />
      <div className="flex flex-1 flex-col lg:min-h-screen">
        <div className="flex justify-end p-4 sm:px-6 lg:px-10">
          <LanguageSwitcher variant="light" />
        </div>
        <main className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.12]" /><span className="absolute -top-16 right-[-4rem] size-72 rounded-full bg-mint blur-3xl" /></div>
          <div className="relative w-full max-w-xl rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.10)] sm:p-8">
            {result ? (
              <div>
                <Notice variant="success" title={t('auth.registrationSubmitted')} className="mb-6">{result.message || t('auth.approvalPendingDesc')}</Notice>
                <p className="text-sm leading-6 text-stone-dark">{t('auth.reviewMessage')}</p>
                <Link to="/login/supplier" className="mt-6 inline-flex w-full justify-center rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deeper">{t('auth.returnToLogin')}</Link>
              </div>
            ) : (
              <>
                <header className="mb-6"><h2 className="font-serif text-2xl font-semibold text-forest-deeper">{t('auth.supplierAccountDetails')}</h2><p className="mt-1 text-sm text-stone">{t('auth.supplierAccountDesc')}</p></header>
                {generalError && <Notice variant="error" className="mb-5">{generalError}</Notice>}
                <form onSubmit={submit} noValidate className="space-y-5">
                  <Field id="supplier-full-name" label={t('auth.contactPersonName')} required error={errors.fullName}><TextInput autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Abebe Bekele" /></Field>
                  <Field id="supplier-company-name" label={t('auth.companyName')} required error={errors.companyName}><TextInput autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Your business name" /></Field>
                  <Notice variant="info" className="border-amber-300 bg-amber-50 text-stone-dark">Enter the phone number you use for this business. Registration collects your contact number and TIN, but does not verify that they are associated.</Notice>
                  <Field id="supplier-phone" label={t('auth.phoneFieldLabel')} required error={errors.phone} hint="Use a business contact number; its association with the TIN is not verified online."><TextInput type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251912345678" /></Field>
                  <Field id="supplier-tin" label={t('auth.tinFieldLabel')} required error={errors.tin} hint="Enter the 10-digit TIN issued to your business."><TextInput inputMode="numeric" autoComplete="off" value={tin} onChange={(event) => setTin(event.target.value)} placeholder="0123456789" /></Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="supplier-password" label={t('common.password')} required error={errors.password}><PasswordInput autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
                    <Field id="supplier-confirm-password" label={t('common.confirmPassword')} required error={errors.confirmPassword}><PasswordInput autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field>
                  </div>
                  <div>
                    <label className="flex items-start gap-2 text-sm leading-5 text-stone-dark"><input type="checkbox" checked={acceptedTerms} onChange={(event) => { setAcceptedTerms(event.target.checked); setErrors((current) => ({ ...current, acceptedTerms: undefined })) }} className="mt-0.5 size-4 shrink-0 accent-forest" /><span>I accept Azmera’s <button type="button" onClick={() => setTermsOpen(true)} className="font-semibold text-forest underline">{t('auth.termsAndConditions')}</button> and <button type="button" onClick={() => setPrivacyOpen(true)} className="font-semibold text-forest underline">{t('auth.privacyPolicy')}</button>.</span></label>
                    {errors.acceptedTerms && <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.acceptedTerms}</p>}
                  </div>
                  <Button type="submit" fullWidth loading={submitting}>{submitting ? t('common.loading') : t('auth.submitSupplierRegistration')}</Button>
                </form>
                <p className="mt-6 text-center text-sm text-stone">{t('auth.alreadyRegistered')} <Link to="/login/supplier" className="font-semibold text-forest underline-offset-2 hover:underline">{t('nav.signIn')}</Link></p>
              </>
            )}
            <LegalDialog open={termsOpen} title={t('auth.termsAndConditions')} onClose={() => setTermsOpen(false)}>
              <p>By creating a supplier account, you agree to provide accurate business information, protect account credentials, and use Azmera in line with its policies.</p>
              <p>Your supplier account remains subject to Azmera review and approval before supplier dashboard access is enabled.</p>
            </LegalDialog>
            <LegalDialog open={privacyOpen} title={t('auth.privacyPolicy')} onClose={() => setPrivacyOpen(false)}>
              <p>Azmera uses the contact and business information you submit to create and review your supplier account. This form does not collect government identity numbers or documents.</p>
              <p>Contact Azmera to access, correct, or ask questions about your account information.</p>
            </LegalDialog>
          </div>
        </main>
        <AgentSignupFooter />
      </div>
    </div>
  )
}
