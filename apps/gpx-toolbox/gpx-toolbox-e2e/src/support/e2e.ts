import '@testing-library/cypress/add-commands'

import './commands'

// The tests assert German texts. The app picks its language from the browser, which differs between
// developer machines and the pipeline, so the browser language is pinned for every page load (also reloads).
Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'language', { configurable: true, value: 'de-DE' })
  Object.defineProperty(win.navigator, 'languages', { configurable: true, value: ['de-DE', 'de'] })
})

beforeEach(() => {
  cy.task('db:reset')
})
