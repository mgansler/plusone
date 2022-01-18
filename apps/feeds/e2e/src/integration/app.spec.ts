describe('github-pipeline-status', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.findByRole('heading', { name: 'Welcome to feeds-web' })
  })
})
