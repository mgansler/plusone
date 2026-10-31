import { unique } from '../support/commands'

describe('login', () => {
  it('sends visitors without session to the login', () => {
    cy.visit('/admin')
    cy.location('pathname').should('eq', '/login')
    cy.findByRole('heading', { name: 'Trailcare' }).should('be.visible')
    cy.request({ url: '/api/trail-areas', failOnStatusCode: false }).its('status').should('eq', 401)
  })

  it('rejects a wrong password', () => {
    cy.visit('/login')
    cy.findByLabelText('Passwort').type('falsch')
    cy.findByRole('button', { name: 'Anmelden' }).click()

    cy.findByRole('alert').should('have.text', 'Das Passwort stimmt nicht.')
    cy.location('pathname').should('eq', '/login')
  })

  it('logs crew members in and out', () => {
    const area = unique('Login')
    cy.createTrailArea(area, [{ name: 'Klabuster' }])
    cy.clearAllCookies()

    cy.visit('/login')
    cy.findByLabelText('Passwort').type(Cypress.expose('crewPassword'))
    cy.findByRole('button', { name: 'Anmelden' }).click()

    cy.location('pathname').should('eq', '/')
    cy.findByRole('heading', { name: area }).should('be.visible')
    cy.findByRole('link', { name: 'Verwaltung' }).should('not.exist')
    cy.getCookie('trailcare_session').should('have.property', 'httpOnly', true)

    cy.findByRole('button', { name: 'Abmelden' }).click()
    cy.findByLabelText('Passwort').should('be.visible')
    cy.request({ url: '/api/trail-areas', failOnStatusCode: false }).its('status').should('eq', 401)
  })

  it('gives admins access to the admin area', () => {
    cy.visit('/login')
    cy.findByLabelText('Passwort').type(Cypress.expose('adminPassword'))
    cy.findByRole('button', { name: 'Anmelden' }).click()

    cy.findByRole('link', { name: 'Verwaltung' }).click()
    cy.location('pathname').should('eq', '/admin')
    cy.findByRole('heading', { name: 'Zugangspasswörter' }).should('be.visible')
  })

  it('keeps crew members out of the admin area', () => {
    cy.loginAs('crew')
    cy.visit('/admin')
    cy.location('pathname').should('eq', '/')
    cy.request({ url: '/api/admin/access-passwords', failOnStatusCode: false }).its('status').should('eq', 403)
  })
})
