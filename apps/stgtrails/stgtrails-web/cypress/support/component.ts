// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
import '@testing-library/cypress/add-commands'

import type { BackendModule } from 'i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import './commands'

i18n
  .use({
    type: 'backend',
    read: (language, namespace, callback) => {
      import('../../public/locales/' + language + '/' + namespace + '.json')
        .then((res) => callback(null, res))
        .catch((error) => callback(error, null))
    },
  } as BackendModule)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    debug: true,
    interpolation: { escapeValue: false },
  })
