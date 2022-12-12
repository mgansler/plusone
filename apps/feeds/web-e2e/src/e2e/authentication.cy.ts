describe('authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should register new account and login', () => {
    const username = Math.random().toString(36).substring(2, 7)

    cy.findByRole('link', { name: 'Login' }).click()
    cy.findByRole('link', { name: "I don't have an account" }).click()

    // eslint-disable-next-line cypress/no-unnecessary-waiting,testing-library/await-async-utils
    cy.location('pathname').should('eq', '/register').wait(500)

    cy.findByRole('textbox', { name: /username/i }).type(username)
    cy.findByLabelText(/password/i).type('just_secret')
    cy.findByRole('button', { name: /register/i }).click()

    // eslint-disable-next-line cypress/no-unnecessary-waiting,testing-library/await-async-utils
    cy.location('pathname').should('eq', '/login').wait(500)

    cy.findByRole('textbox', { name: /username/i }).type(username)
    cy.findByLabelText(/password/i).type('just_secret')
    cy.findByRole('button', { name: /login/i }).click()

    cy.location('pathname').should('eq', '/member/feeds')
    cy.findByText(username)
  })
})
