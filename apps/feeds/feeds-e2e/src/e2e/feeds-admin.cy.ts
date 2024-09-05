describe('feeds-web', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show admin area', () => {
    cy.loginAdmin()

    cy.location('pathname').should('eq', '/admin')
    cy.findByText('Admin Area').should('be.visible')
    cy.findByText('status: ok').should('be.visible')

    cy.findByText(/total feeds: \d+/).should('be.visible')
    cy.findByText(/total articles: \d+/).should('be.visible')
    cy.findByText(/total users: \d+/).should('be.visible')
  })
})
