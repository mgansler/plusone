import { STRAVA_ATHLETE } from '../support/strava-mock'

describe('authentication', () => {
  it('sends visitors without login to the login page', () => {
    cy.visit('/')

    cy.location('pathname').should('eq', '/login')
    cy.findByRole('heading', { name: 'GPX-Toolcat' }).should('be.visible')
    cy.request({ url: '/api/routes', failOnStatusCode: false }).its('status').should('eq', 401)
  })

  it('logs in with Strava and out again', () => {
    cy.visit('/login')
    cy.findByRole('button', { name: 'Connect with Strava' }).click()

    // Back from Strava (mock) with the JWT, which is removed from the URL
    cy.location('pathname').should('eq', '/')
    cy.location('hash').should('eq', '')
    cy.findByRole('heading', { name: 'Routen (0)' }).should('be.visible')
    cy.findByRole('button', { name: new RegExp(STRAVA_ATHLETE.firstname) }).should('be.visible')
    cy.getCookie('gpx_toolbox_oauth_state').should('be.null')

    cy.findByRole('button', { name: 'Abmelden' }).click()
    cy.location('pathname').should('eq', '/login')
    cy.window().its('localStorage').invoke('getItem', 'gpx-toolbox-jwt').should('be.null')
  })

  it('rejects a callback that was not started by this browser', () => {
    cy.request({ url: '/api/auth/strava/callback?code=e2e-code&state=forged', failOnStatusCode: false })
      .its('status')
      .should('eq', 401)
  })

  it('drops an invalid stored token', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('gpx-toolbox-jwt', 'not-a-jwt')
      },
    })

    cy.location('pathname').should('eq', '/login')
    cy.window().its('localStorage').invoke('getItem', 'gpx-toolbox-jwt').should('be.null')
  })
})
