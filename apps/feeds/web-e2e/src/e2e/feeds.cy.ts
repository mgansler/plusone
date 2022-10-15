describe('feeds', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should discover and add a feed', () => {
    cy.loginFreshUser()

    cy.findByRole('textbox', { name: 'url' }).type('https://www.youtube.com/c/iskall85/videos')
    cy.findByRole('button', { name: 'search' }).click()
    cy.findByRole('textbox', { name: 'titel' }).should('have.value', 'iskall85')
    cy.findByRole('textbox', { name: 'feed-url' }).should(
      'have.value',
      'http://www.youtube.com/feeds/videos.xml?channel_id=UCZ9x-z3iOnIbJxVpm1rsu2A',
    )
    cy.findByRole('button', { name: 'save' }).click()

    cy.forceFetchFeeds()
  })
})
