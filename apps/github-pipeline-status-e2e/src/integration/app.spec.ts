import { getGreeting } from '../support/app.po'

describe('github-pipeline-status', () => {
  beforeEach(() => cy.visit('/'))

  it.skip('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.login('my-email@something.com', 'myPassword')

    getGreeting().contains('Welcome to github-pipeline-status!')
  })
})
