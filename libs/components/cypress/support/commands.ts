/// <reference types="cypress" />
import { mount } from 'cypress/react'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/consistent-type-definitions
    interface Chainable<Subject> {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
