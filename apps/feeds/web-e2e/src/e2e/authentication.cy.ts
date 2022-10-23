describe('authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should register new account and login', () => {
    const username = Math.random().toString(36).substring(2, 7)

    cy.findByRole('link', { name: 'Login' }).click()
    cy.findByRole('link', { name: "I don't have an account" }).click()

    cy.location('pathname').should('eq', '/register')

    cy.findByRole('textbox', { name: 'username' }).type(username)
    cy.findByLabelText('password').type('just_secret')
    cy.findByRole('button', { name: 'register' }).click()

    cy.location('pathname').should('eq', '/login')

    cy.findByRole('textbox', { name: 'username' }).type(username)
    cy.findByLabelText('password').type('just_secret')
    cy.findByRole('button', { name: 'login' }).click()

    cy.location('pathname').should('eq', '/member/feeds')
    cy.findByText(username)
  })
})
