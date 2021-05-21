describe('dinner plan', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.findAllByRole('link', { name: /dinner plan/i }).click()
  })

  it('should display welcome message', () => {
    cy.get('h2').contains('Welcome to dinner-plan!')
  })
})
