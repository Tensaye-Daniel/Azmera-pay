import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { en } from './locales/en'
import { am } from './locales/am'

export const defaultNS = 'translation'
export const resources = {
  en: { translation: en },
  am: { translation: am },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'am'],
    defaultNS,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'azmera_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

// Keep html lang attribute in sync with current language
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'en'
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng
    try {
      localStorage.setItem('azmera_language', lng)
    } catch {
      // Local storage unavailable
    }
  })
}

export default i18n
