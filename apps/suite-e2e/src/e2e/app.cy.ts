describe('suite', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.get('a').contains("Martin's App Suite")
  })
})
