import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

console.log('hello i18n')

i18n
  .use(LanguageDetector)
  .use(Backend)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['navigator'],
    },
    fallbackLng: 'en',
    load: 'languageOnly',
    debug: true,
    interpolation: { escapeValue: false },
  })

export default i18n
