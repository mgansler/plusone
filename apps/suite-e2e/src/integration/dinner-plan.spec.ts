describe('dinner plan', () => {
  // '/YYYY/DD'
  const pathRegex = /\/\d\d\d\d\/\d\d?$/

  beforeEach(() => {
    cy.visit('/')
    cy.findByRole('link', { name: /dinner plan/i }).click()
  })

  it('should display welcome message', () => {
    cy.get('a').contains('Dinner Plan')
  })

  it('should show the current week', () => {
    cy.url().should('match', pathRegex)
  })

  it('should show the previous week', () => {
    cy.findByRole('button', { name: /last week/i }).click()
    cy.url().should('match', pathRegex)
  })

  it('should show the next week', () => {
    cy.findByRole('button', { name: /next week/i }).click()
    cy.url().should('match', pathRegex)
  })

  it('should be possible to plan dinner', () => {
    cy.findByRole('textbox').type('spaghetti{enter}')
    cy.findByRole('textbox').type('risotto{enter}')

    cy.drag('risotto', 'Monday')
    cy.drag('spaghetti', 'Friday')

    cy.findDropzoneByName('Monday').findByText('risotto').should('be.visible')
    cy.findDropzoneByName('Friday').findByText('spaghetti').should('be.visible')

    cy.findByRole('button', { name: /next week/i }).click()

    // Dishes should still be available
    cy.findByRole('button', { name: 'risotto' })
    cy.findByRole('button', { name: 'spaghetti' })

    // No dishes should be planned
    cy.findDropzoneByName('Monday').findByText('risotto').should('not.exist')
    cy.findDropzoneByName('Friday').findByText('spaghetti').should('not.exist')
  })
})
