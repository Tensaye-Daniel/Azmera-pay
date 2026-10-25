import { useTranslation } from 'react-i18next'
import { GlobeIcon } from './icons'

interface LanguageSwitcherProps {
  className?: string
  theme?: 'auto' | 'light' | 'dark'
  variant?: 'auto' | 'light' | 'dark' | 'simple'
}

export default function LanguageSwitcher({
  className = '',
  theme = 'auto',
  variant,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('am') ? 'am' : 'en'

  const setLanguage = (lang: 'en' | 'am') => {
    void i18n.changeLanguage(lang)
    try {
      localStorage.setItem('azmera_language', lang)
      document.documentElement.lang = lang
    } catch {
      // ignore
    }
  }

  const effectiveTheme = variant || theme
  const isDark = effectiveTheme === 'dark'

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-1 rounded-full p-1 transition-colors ${
        isDark
          ? 'border border-white/20 bg-white/10 text-white backdrop-blur'
          : 'border border-forest/15 bg-white/90 text-forest-dark shadow-sm backdrop-blur'
      } ${className}`}
    >
      <span className="grid size-6 place-items-center pl-1 text-forest" aria-hidden="true">
        <GlobeIcon className={`size-3.5 ${isDark ? 'text-gold' : 'text-forest'}`} />
      </span>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={currentLang === 'en'}
        title="Switch to English"
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
          currentLang === 'en'
            ? isDark
              ? 'bg-gold text-forest-deeper shadow-sm'
              : 'bg-forest text-white shadow-sm'
            : isDark
              ? 'text-white/80 hover:text-white'
              : 'text-stone hover:text-forest-dark'
        }`}
      >
        EN
      </button>

      <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-stone/30'}`}>|</span>

      <button
        type="button"
        onClick={() => setLanguage('am')}
        aria-pressed={currentLang === 'am'}
        title="ወደ አማርኛ ቀይር"
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
          currentLang === 'am'
            ? isDark
              ? 'bg-gold text-forest-deeper shadow-sm'
              : 'bg-forest text-white shadow-sm'
            : isDark
              ? 'text-white/80 hover:text-white'
              : 'text-stone hover:text-forest-dark'
        }`}
      >
        አማ
      </button>
    </div>
  )
}
