describe('feeds-web', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    cy.findByRole('heading', { name: /welcome to feeds-web-login/i })
  })
})
