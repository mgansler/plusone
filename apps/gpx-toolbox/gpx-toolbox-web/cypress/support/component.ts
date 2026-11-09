// Cypress component-test support file, loaded before the test files.
// Adds the common Testing-Library commands (cy.mount, cy.contains, …).
import '@testing-library/cypress/add-commands'

// The components are mounted without the app, so i18n is initialized with the German texts the tests assert.
import '../../src/test-i18n'
