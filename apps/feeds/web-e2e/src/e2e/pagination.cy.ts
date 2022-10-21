describe('feeds-web', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load pages of articles', () => {
    cy.addHeiseFeedToDefaultUser()
    cy.forceFetchFeeds()
    cy.login()

    cy.findByRole('region', { name: 'heise online News' }).click()
    cy.findAllByRole('article').should('have.length', 10)
    cy.findByRole('button', { name: 'next' }).click()
    cy.findAllByRole('article').should('have.length', 20)
  })
})
