// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    forceFetchFeeds(): void

    login(): void

    loginFreshUser(): void

    loginAdmin(): void

    addFeedExistingToDefaultUser(): void

    addFeedPaginationToDefaultUser(): void
  }
}

Cypress.Commands.add('forceFetchFeeds', () => {
  cy.request('POST', '/api/authentication/login', {
    username: 'root',
    password: 'local_admin_password',
  }).then((resp) => {
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
  cy.location('pathname', { timeout: 10_000 }).should('eq', '/member/feeds')
})

Cypress.Commands.add('loginFreshUser', () => {
  const username = Math.random().toString(36).substring(2, 7)
  cy.visit('/register')
  cy.findByRole('textbox', { name: /username/i }).type(username)
  cy.findByLabelText(/password/i).type('random_password')
  cy.findByRole('button', { name: 'register' }).click()
  // eslint-disable-next-line cypress/no-unnecessary-waiting,testing-library/await-async-utils
  cy.location('pathname', { timeout: 10_000 }).should('eq', '/login').wait(500)
  cy.findByRole('textbox', { name: /username/i }).type(username)
  cy.findByLabelText(/password/i).type('random_password')
  cy.findByRole('button', { name: /login/i }).click()
  cy.location('pathname', { timeout: 10_000 }).should('eq', '/member/feeds')
})

Cypress.Commands.add('loginAdmin', () => {
  cy.visit('/login')
  cy.findByRole('textbox', { name: /username/i }).type('root')
  cy.findByLabelText(/password/i).type('local_admin_password')
  cy.findByRole('button', { name: /login/i }).click()
  cy.location('pathname', { timeout: 10_000 }).should('eq', '/admin')
})

Cypress.Commands.add('addFeedExistingToDefaultUser', () => {
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
        title: 'Feed Existing',
        url: 'http://localhost:3334/feeds/existing.html',
        feedUrl: 'http://localhost:3334/feeds/existing.xml',
      },
      failOnStatusCode: false,
    })
  })
})

Cypress.Commands.add('addFeedPaginationToDefaultUser', () => {
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
        title: 'Feed Pagination',
        url: 'http://localhost:3334/feeds/pagination.html',
        feedUrl: 'http://localhost:3334/feeds/pagination.xml',
      },
      failOnStatusCode: false,
    })
  })
})
