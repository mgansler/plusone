describe('dinner plan', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.findByRole('link', { name: /dinner plan/i }).click()
  })

  it('should display welcome message', () => {
    cy.get('h2').contains('Welcome to dinner-plan!')
  })

  it('should show the current week', () => {
    cy.findAllByRole('heading', { name: /this week/i })
  })

  it('should show the previous week', () => {
    cy.findByRole('link', { name: /last week/i }).click()
    cy.findAllByRole('heading', { name: /last week/i })
  })

  it('should show the next week', () => {
    cy.findByRole('link', { name: /next week/i }).click()
    cy.findAllByRole('heading', { name: /next week/i })
  })
})
