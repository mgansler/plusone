describe('my-remix-app', () => {
  beforeEach(() => cy.visit('http://localhost:3000/'))

  it('should display welcome message', () => {
    cy.findByRole('heading', { name: 'Welcome to Remix!' })
  })
})
