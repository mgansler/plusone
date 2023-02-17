describe('vuerdle', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.findByRole('heading', { name: 'Welcome vuerdle' }).should('be.visible')
  })
})
