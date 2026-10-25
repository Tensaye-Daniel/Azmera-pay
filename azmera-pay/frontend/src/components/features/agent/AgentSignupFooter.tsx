import { useTranslation } from 'react-i18next'

export default function AgentSignupFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-forest/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <span className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-forest/10">
          <img
            src="/images/logo.png"
            alt="Azmera"
            className="h-7 w-auto max-w-[8rem] object-contain"
          />
        </span>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          <a
            href="#terms"
            className="text-xs font-medium text-stone transition-colors hover:text-forest-deeper"
          >
            {t('common.terms')}
          </a>
          <a
            href="#privacy"
            className="text-xs font-medium text-stone transition-colors hover:text-forest-deeper"
          >
            {t('common.privacy')}
          </a>
          <a
            href="mailto:hello@azmera.et"
            className="text-xs font-medium text-stone transition-colors hover:text-forest-deeper"
          >
            {t('common.contact')}
          </a>
        </nav>

        <p className="text-xs text-stone">
          {t('landing.footer.copyright')} {t('landing.footer.tagline')}
        </p>
      </div>
    </footer>
  )
}
