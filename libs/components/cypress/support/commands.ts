import { mount } from 'cypress/react18'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
