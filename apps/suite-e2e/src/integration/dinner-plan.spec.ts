describe('dinner plan', () => {
  // '/YYYY/DD'
  const pathRegex = /\/\d\d\d\d\/\d\d?$/

  beforeEach(() => {
    cy.visit('/')
    cy.findByRole('link', { name: /dinner plan/i }).click()
  })

  it('should display welcome message', () => {
    cy.get('a').contains('Dinner Plan')
  })

  it('should show the current week', () => {
    cy.url().should('match', pathRegex)
  })

  it('should show the previous week', () => {
    cy.findByRole('link', { name: /last week/i }).click()
    cy.url().should('match', pathRegex)
  })

  it('should show the next week', () => {
    cy.findByRole('link', { name: /next week/i }).click()
    cy.url().should('match', pathRegex)
  })
})
