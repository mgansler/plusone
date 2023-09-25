describe('elgato-frontend', () => {
  beforeEach(() => cy.visit('/'))

  it('should ', () => {
    cy.findByRole('heading', { name: 'Welcome to Elgato Control' }).should('be.visible')
  })
})
