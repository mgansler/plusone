describe('advent-of-code-2021', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.document().title().should('eq', 'Advent of Code 2021')
  })
})
