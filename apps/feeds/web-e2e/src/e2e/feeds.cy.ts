describe('feeds', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should discover and add a feed', () => {
    cy.loginFreshUser()

    cy.findByText('iskall85').should('not.exist')

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'url' }).type('https://www.youtube.com/c/iskall85/videos')
    cy.findByRole('button', { name: 'search' }).click()
    cy.findByRole('textbox', { name: 'title', timeout: 10_000 }).should('have.value', 'iskall85')
    cy.findByRole('textbox', { name: 'feed-url' }).should(
      'have.value',
      'http://www.youtube.com/feeds/videos.xml?channel_id=UCZ9x-z3iOnIbJxVpm1rsu2A',
    )
    cy.findByRole('button', { name: /save/i }).click()

    cy.findByRole('button', { name: /iskall85/ }).should('be.visible')
  })

  it('should allow adding a feed manually and mark all articles as read', () => {
    cy.loginFreshUser()

    cy.findByText('Dilbert Daily Strips').should('not.exist')

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'title' }).type('Dilbert Daily Strips')
    cy.findByRole('textbox', { name: 'url' }).type('https://dilbert.com')
    cy.findByRole('textbox', { name: 'feed-url' }).type('https://dilbert.com/feed')

    cy.findByRole('button', { name: 'save' }).click()

    cy.findByRole('button', { name: /Dilbert Daily Strips/, timeout: 20_000 }).click()

    cy.get('article').findAllByTestId('CheckBoxOutlinedIcon').should('have.length', 0)
    let articleCount: number
    cy.get('article')
      .findAllByTestId('CheckBoxOutlineBlankIcon')
      .should('have.length.at.least', 1)
      .then(($checkboxes) => (articleCount = $checkboxes.length))
    cy.findByRole('button', { name: 'Mark all read' }).click()
    cy.get('article')
      .findAllByTestId('CheckBoxOutlinedIcon')
      .should(($checkboxes) => expect($checkboxes.length).to.equal(articleCount))
    cy.get('article').findAllByTestId('CheckBoxOutlineBlankIcon').should('have.length', 0)
  })

  it('should handle failing to add an existing feed', () => {
    cy.addHeiseFeedToDefaultUser()
    cy.login()

    cy.findByRole('link', { name: 'add feed' }).click()

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

  it('should import multiple feeds', () => {
    cy.loginFreshUser()

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'import' }).type(
      '{{}"title": "AnandTech","feedUrl": "https://www.anandtech.com/rss/articlefeed.aspx"},{{}"title": "ComputerBase","feedUrl": "https://www.computerbase.de/rss/news.xml"}',
    )

    cy.findByRole('button', { name: 'import' }).click()

    cy.findByRole('button', { name: /AnandTech/, timeout: 20_000 }).should('be.visible')
    cy.findByRole('button', { name: /ComputerBase/, timeout: 20_000 }).should('be.visible')
  })
})
