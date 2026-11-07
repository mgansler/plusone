import { GOOGLE_USER } from '../support/google-mock'

describe('authentication', () => {
  it('sends visitors without login to the login page', () => {
    cy.visit('/')

    cy.location('pathname').should('eq', '/login')
    cy.findByRole('heading', { name: 'GPX-Toolcat' }).should('be.visible')
    cy.request({ url: '/api/routes', failOnStatusCode: false }).its('status').should('eq', 401)
  })

  it('logs in with Google and out again', () => {
    cy.visit('/login')
    cy.findByRole('button', { name: 'Mit Google anmelden' }).click()

    // Back from Google (mock) with the JWT, which is removed from the URL
    cy.location('pathname').should('eq', '/routes')
    cy.location('hash').should('eq', '')
    cy.findByRole('heading', { name: 'Routen (0)' }).should('be.visible')
    cy.findByText(GOOGLE_USER.name).should('be.visible')
    cy.getCookie('gpx_toolbox_oauth').should('be.null')

    cy.findByRole('button', { name: 'Abmelden' }).click()
    cy.location('pathname').should('eq', '/login')
    cy.window().its('localStorage').invoke('getItem', 'gpx-toolbox-jwt').should('be.null')
  })

  it('shows the privacy policy without login, linked from the login page', () => {
    cy.visit('/login')

    cy.findByRole('link', { name: 'Datenschutzerklärung' }).click()

    cy.location('pathname').should('eq', '/datenschutz')
    cy.findByRole('heading', { name: 'Datenschutzerklärung' }).should('be.visible')
    cy.findByRole('heading', { name: /Anmeldung mit Google/ }).should('be.visible')
  })

  it('shows the imprint without login, linked from the login page', () => {
    cy.visit('/login')

    cy.findByRole('link', { name: 'Impressum' }).click()

    cy.location('pathname').should('eq', '/impressum')
    cy.findByRole('heading', { name: 'Impressum' }).should('be.visible')
    cy.findByText(/Ludwigstraße 42/).should('be.visible')
  })

  it('creates the user on the first login and finds it again on the next one', () => {
    cy.login().then((first) => {
      cy.request({ url: '/api/auth/status', headers: { Authorization: `Bearer ${first}` } })
        .its('body.user')
        .then((user) => {
          expect(user).to.include({ name: GOOGLE_USER.name, email: GOOGLE_USER.email })

          cy.login().then((second) => {
            cy.request({ url: '/api/auth/status', headers: { Authorization: `Bearer ${second}` } })
              .its('body.user.id')
              .should('eq', user.id)
          })
        })
    })
  })

  it('tells the user when the login was declined on the Google page', () => {
    cy.task('google:user', null)
    cy.visit('/login')

    cy.findByRole('button', { name: 'Mit Google anmelden' }).click()

    cy.location('pathname').should('eq', '/login')
    cy.findByText('Die Anmeldung wurde abgebrochen.').should('be.visible')
    cy.window().its('localStorage').invoke('getItem', 'gpx-toolbox-jwt').should('be.null')
  })

  it('rejects a callback that was not started by this browser', () => {
    cy.request({ url: '/api/auth/google/callback?code=e2e-code&state=forged', failOnStatusCode: false })
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
