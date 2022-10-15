// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    forceFetchFeeds(): void

    login(): void

    loginFreshUser(): void
  }
}

Cypress.Commands.add('forceFetchFeeds', () => {
  cy.request('POST', '/api/authentication/login', { username: 'root', password: 'keep_this_secret' }).then((resp) => {
    cy.request({ method: 'POST', url: '/api/scheduling/now', auth: { bearer: resp.body.access_token } })
  })
})

Cypress.Commands.add('login', () => {
  cy.visit('/login')
  cy.findByRole('textbox', { name: 'username' }).type('user')
  cy.findByLabelText('password').type('just_secret')
  cy.findByRole('button', { name: 'login' }).click()
})

Cypress.Commands.add('loginFreshUser', () => {
  const username = Math.random().toString(36).substring(2, 7)
  cy.visit('/login/register')
  cy.findByRole('textbox', { name: 'username' }).type(username)
  cy.findByLabelText('password').type('random_password')
  cy.findByRole('button', { name: 'register' }).click()
  cy.location('pathname').should('eq', '/login')
  cy.findByRole('textbox', { name: 'username' }).type(username)
  cy.findByLabelText('password').type('random_password')
  cy.findByRole('button', { name: 'login' }).click()
})