// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    fetchFeeds(): void

    login(): void
  }
}

Cypress.Commands.add('fetchFeeds', () => {
  cy.request('POST', '/api/authentication/login', { username: 'root', password: 'keep_this_secret' }).then((resp) => {
    console.log(resp)
  })
})

Cypress.Commands.add('login', () => {
  cy.visit('/login')
  cy.findByRole('textbox', { name: 'username' }).type('user')
  cy.findByLabelText('password').type('just_secret')
  cy.findByRole('button', { name: 'login' }).click()
})
