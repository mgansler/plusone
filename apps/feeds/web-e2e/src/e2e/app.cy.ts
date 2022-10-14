describe('feeds-web', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/')
  })

  it('should display welcome message and status', () => {
    cy.findByRole('heading', { name: 'Welcome feeds-web' })
    cy.findByText('status: ok')
  })
})
