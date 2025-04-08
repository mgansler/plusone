describe('feeds', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should discover and add a feed', () => {
    cy.loginFreshUser()

    cy.findByText('Feed Discover').should('not.exist')

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'url' }).type('http://localhost:3334/feeds/discover.html')
    cy.findByRole('button', { name: 'search' }).click()
    cy.findByRole('textbox', { name: 'title', timeout: 20_000 }).should('have.value', 'Feed Discover')
    cy.findByRole('textbox', { name: 'feed-url' }).should('have.value', 'http://localhost:3334/feeds/discover.xml')
    cy.findByRole('button', { name: /save/i }).click()

    cy.findByRole('button', { name: /Feed Discover/, timeout: 20_000 }).should('be.visible')
  })

  it('should allow adding a feed manually and mark all articles as read', () => {
    cy.loginFreshUser()

    cy.findByText('Feed Manual').should('not.exist')

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'url' }).type('http://localhost:3334/feeds/manual.html')
    cy.findByRole('textbox', { name: 'title' }).type('Feed Manual')
    cy.findByRole('textbox', { name: 'feed-url' }).type('http://localhost:3334/feeds/manual.xml')

    cy.findByRole('button', { name: 'save' }).click()

    cy.findByRole('button', { name: /Feed Manual/, timeout: 20_000 }).click()

    cy.get('article').findAllByTestId('CheckBoxOutlinedIcon').should('have.length', 0)
    let articleCount: number
    cy.get('article')
      .findAllByLabelText('Mark read')
      .should('have.length.at.least', 1)
      .then(($checkboxes) => (articleCount = $checkboxes.length))

    // Mark one as read manually to later check in recently read articles
    cy.get('article').findAllByLabelText('Mark read').first().click()
    cy.findByRole('button', { name: 'Mark all read' }).click()
    cy.get('article')
      .findAllByLabelText('Mark unread')
      .should(($checkboxes) => expect($checkboxes.length).to.equal(articleCount))
    cy.get('article').findAllByTestId('Mark read').should('have.length', 0)

    cy.findByRole('button', { name: /Recently Read/i }).click()
    cy.get('article').should('have.length', 1)
  })

  it('should handle failing to add an existing feed', () => {
    cy.addFeedExistingToDefaultUser()
    cy.login()

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'url' }).type('http://localhost:3334/feeds/existing.html')
    cy.findByRole('textbox', { name: 'title' }).type('Feed Existing')
    cy.findByRole('textbox', { name: 'feed-url' }).type('http://localhost:3334/feeds/existing.xml')
    cy.findByRole('button', { name: 'save' }).click()

    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('You are already subscribed to this feed')) {
        return false
      }
    })
    cy.findByText('Could not add feed: You are already subscribed to this feed', { timeout: 10_000 }).should(
      'be.visible',
    )
    // Force click because in development mode there will be an overlay even though there is an error boundary
    cy.findByRole('button', { name: 'reset' }).click({ force: true })
    cy.findByRole('textbox', { name: 'url' }).should('have.value', '')
    cy.findByRole('textbox', { name: 'title' }).should('have.value', '')
    cy.findByRole('textbox', { name: 'feed-url' }).should('have.value', '')
  })

  it('should import multiple feeds', () => {
    cy.loginFreshUser()

    cy.findByRole('link', { name: 'add feed' }).click()

    cy.findByRole('textbox', { name: 'import' }).type(
      '{{}"title": "Multiple 01","feedUrl": "http://localhost:3334/feeds/multiple-01.xml"},{{}"title": "Multiple 02","feedUrl": "http://localhost:3334/feeds/multiple-02.xml"}',
    )

    cy.findByRole('button', { name: 'import' }).click()

    cy.findByRole('button', { name: /Multiple 01/, timeout: 20_000 }).should('be.visible')
    cy.findByRole('button', { name: /Multiple 02/, timeout: 20_000 }).should('be.visible')
  })
})
