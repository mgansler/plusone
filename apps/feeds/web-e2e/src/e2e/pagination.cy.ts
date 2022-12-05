describe('feeds-web', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load pages of articles', () => {
    cy.addHeiseFeedToDefaultUser()
    cy.forceFetchFeeds()
    cy.login()

    cy.findByRole('button', { name: 'heise online News' }).click()
    cy.findAllByRole('article').should('have.length', 20)
    cy.findByRole('button', { name: /more/i }).click()
    cy.findAllByRole('article').should('have.length', 40)
  })
})
