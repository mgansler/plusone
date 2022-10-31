describe('feeds', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should discover and add a feed', () => {
    cy.loginFreshUser()

    cy.findByText('iskall85').should('not.exist')

    cy.findByRole('button', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'url' }).type('https://www.youtube.com/c/iskall85/videos')
    cy.findByRole('button', { name: 'search' }).click()
    cy.findByRole('textbox', { name: 'title', timeout: 10_000 }).should('have.value', 'iskall85')
    cy.findByRole('textbox', { name: 'feed-url' }).should(
      'have.value',
      'http://www.youtube.com/feeds/videos.xml?channel_id=UCZ9x-z3iOnIbJxVpm1rsu2A',
    )
    cy.findByRole('button', { name: 'save' }).click()

    cy.findByText('iskall85').should('be.visible')
  })

  it('should allow adding a feed manually', () => {
    cy.loginFreshUser()

    cy.findByText('Dilbert Daily Strips').should('not.exist')

    cy.findByRole('button', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'title' }).type('Dilbert Daily Strips')
    cy.findByRole('textbox', { name: 'url' }).type('https://dilbert.com')
    cy.findByRole('textbox', { name: 'feed-url' }).type('https://dilbert.com/feed')

    cy.findByRole('button', { name: 'save' }).click()

    cy.findByText('Dilbert Daily Strips').should('be.visible')
  })

  it('should handle failing to add an existing feed', () => {
    cy.addHeiseFeedToDefaultUser()
    cy.login()

    cy.findByRole('button', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'title' }).type('heise online News')
    cy.findByRole('textbox', { name: 'url' }).type('https://heise.de')
    cy.findByRole('textbox', { name: 'feed-url' }).type('https://www.heise.de/rss/heise.rdf')
    cy.findByRole('button', { name: 'save' }).click()

    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('You are already subscribed to this feed')) {
        return false
      }
    })
    cy.findByText('Could not add feed: You are already subscribed to this feed', { timeout: 10_000 }).should(
      'be.visible',
    )
    // Force click because in development mode there will be an overlay even though there is an error boundary
    cy.findByRole('button', { name: 'reset' }).click({ force: true })
    cy.findByRole('textbox', { name: 'title' }).should('have.value', '')
    cy.findByRole('textbox', { name: 'url' }).should('have.value', '')
    cy.findByRole('textbox', { name: 'feed-url' }).should('have.value', '')
  })
})
