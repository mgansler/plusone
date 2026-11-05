import { GOOGLE_USER } from '../support/google-mock'

// The topbar also shows the name of the user, so the account is looked up in the page content
describe('settings', () => {
  it('shows the account', () => {
    cy.visitLoggedIn('/settings')

    cy.findByRole('heading', { name: 'Einstellungen' }).should('be.visible')
    cy.get('main').findByText(GOOGLE_USER.name).should('be.visible')
    cy.findByText(GOOGLE_USER.email).should('be.visible')
  })

  it('is reachable from the topbar', () => {
    cy.visitLoggedIn('/')

    cy.findByRole('link', { name: GOOGLE_USER.name }).click()

    cy.location('pathname').should('eq', '/settings')
  })

  it('links the privacy policy', () => {
    cy.visitLoggedIn('/settings')

    cy.findByRole('link', { name: 'Datenschutzerklärung' }).click()

    cy.location('pathname').should('eq', '/datenschutz')
    cy.findByRole('heading', { name: 'Datenschutzerklärung' }).should('be.visible')
  })
})
