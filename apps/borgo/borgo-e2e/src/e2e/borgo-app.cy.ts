describe('borgo-e2e', () => {
  beforeEach(() => cy.visit('/'))

  it('should display all header lines', () => {
    cy.findByLabelText(/Borgo's Bakery/).should('be.visible')
    cy.findByLabelText(/Borgo's Beverages/).should('be.visible')
    cy.findByLabelText(/Borgo's Bikes/).should('be.visible')
  })
})
