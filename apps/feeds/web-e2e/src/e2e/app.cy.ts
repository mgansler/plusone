describe('feeds-web', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display welcome message and status', () => {
    cy.findByRole('heading', { name: 'Welcome feeds-web' })
  })
})
