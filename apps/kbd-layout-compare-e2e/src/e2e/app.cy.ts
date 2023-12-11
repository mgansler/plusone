describe('kbd-layout-compare-e2e', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.get('h1').contains(/Welcome/)
  })
})
