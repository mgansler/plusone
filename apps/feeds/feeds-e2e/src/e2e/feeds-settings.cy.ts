describe('feeds-settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should disable a feed', () => {
    const feedName = 'manual'

    cy.loginFreshUser()
    cy.addFeed(feedName)

    cy.findByRole('list', { name: 'other feed list' }).within(() => {
      cy.findByText(feedName).parent().should('have.css', 'text-decoration-line').and('include', 'none')
    })

    cy.findByText(feedName)
      .parentsUntil('li')
      .parent('li')
      .within(() => {
        cy.findByRole('button', { name: 'Settings' }).click()
      })

    cy.findByRole('checkbox', { name: 'Disabled' }).check()
    cy.findByRole('button', { name: 'Save' }).click()

    cy.findByRole('list', { name: 'other feed list' }).within(() => {
      cy.findByText(feedName).parent().should('have.css', 'text-decoration-line').and('include', 'line-through')
    })
  })
})
