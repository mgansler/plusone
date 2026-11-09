import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Load the German locale synchronously instead of through the HTTP backend of the app, so tests
// neither depend on the language of the browser or host nor wait for a request.
import translations from '../public/locales/de/translation.json'

void i18n.use(initReactI18next).init({
  lng: 'de',
  fallbackLng: 'de',
  resources: {
    de: { translation: translations },
  },
  interpolation: {
    escapeValue: false,
  },
})
