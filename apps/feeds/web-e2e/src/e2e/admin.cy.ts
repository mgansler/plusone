describe('feeds-web', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show admin area', () => {
    cy.loginAdmin()

    cy.location('pathname').should('eq', '/admin')
    cy.findByText('status: ok').should('be.visible')
    cy.findByText('Admin Area').should('be.visible')
  })
})
