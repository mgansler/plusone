import { authorizationUri } from '../fixtures'

describe('feeds-frontend', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:3000/graphql', (req) => {
      console.log(req)
      req.reply(authorizationUri)
    })

    cy.visit('/')
  })

  it('should display welcome message on login page', () => {
    cy.findByRole('heading', { level: 3 }).should(
      'have.text',
      'Welcome to Feeds',
    )

    cy.findByRole('link')
      .should('have.text', 'Login with GitLab')
      .should('have.attr', 'href', authorizationUri.data.authorizationUri)
  })
})
