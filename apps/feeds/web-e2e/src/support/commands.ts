// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    forceFetchFeeds(): void

    login(): void

    loginFreshUser(): void

    loginAdmin(): void

    addHeiseFeedToDefaultUser(): void
  }
}

Cypress.Commands.add('forceFetchFeeds', () => {
  cy.request('POST', '/api/authentication/login', { username: 'root', password: 'keep_this_secret' }).then((resp) => {
    cy.request({ method: 'POST', url: '/api/scheduling/now', auth: { bearer: resp.body.access_token } })
  })
})

Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: '/api/authentication/register',
    body: { username: 'user', password: 'just_secret' },
    failOnStatusCode: false,
    timeout: 10_000,
  })

  cy.visit('/login')
  cy.findByRole('textbox', { name: /username/i }).type('user')
  cy.findByLabelText(/password/i).type('just_secret')
  cy.findByRole('button', { name: /login/i }).click()
})

Cypress.Commands.add('loginFreshUser', () => {
  const username = Math.random().toString(36).substring(2, 7)
  cy.visit('/register')
  cy.findByRole('textbox', { name: /username/i }).type(username)
  cy.findByLabelText(/password/i).type('random_password')
  cy.findByRole('button', { name: 'register' }).click()
  cy.location('pathname').should('eq', '/login')
  cy.findByRole('textbox', { name: /username/i }).type(username)
  cy.findByLabelText(/password/i).type('random_password')
  cy.findByRole('button', { name: /login/i }).click()
})

Cypress.Commands.add('loginAdmin', () => {
  cy.visit('/login')
  cy.findByRole('textbox', { name: /username/i }).type('root')
  cy.findByLabelText(/password/i).type('keep_this_secret')
  cy.findByRole('button', { name: /login/i }).click()
})

Cypress.Commands.add('addHeiseFeedToDefaultUser', () => {
  cy.request({
    method: 'POST',
    url: '/api/authentication/register',
    body: { username: 'user', password: 'just_secret' },
    failOnStatusCode: false,
  })

  cy.request('POST', '/api/authentication/login', { username: 'user', password: 'just_secret' }).then((resp) => {
    cy.request({
      method: 'POST',
      url: '/api/feed',
      auth: { bearer: resp.body.access_token },
      body: {
        title: 'heise online News',
        url: 'https://heise.de',
        feedUrl: 'https://www.heise.de/rss/heise.rdf',
      },
      failOnStatusCode: false,
    })
  })
})
