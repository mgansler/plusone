import '@testing-library/cypress/add-commands'

import './commands'

beforeEach(() => {
  cy.task('db:reset')
})
