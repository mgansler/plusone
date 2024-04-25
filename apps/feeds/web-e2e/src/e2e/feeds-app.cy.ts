describe('feeds-web', () => {
  it('should display welcome message and status', () => {
    cy.visit('/')
    cy.findByRole('heading', { name: 'Feeds' })
  })

  it('should prompt to install an update', () => {
    localStorage.setItem('feeds_app_version', '0.1')

    const confirmed = cy.stub().as('confirmed').onFirstCall().returns(true)
    cy.on('window:confirm', confirmed)
    cy.window().then((w) => (w['beforeReload'] = true))
    cy.window().should('have.prop', 'beforeReload', true)

    cy.visit('/')

    cy.get('@confirmed').should('have.been.calledOnce')
    cy.window().should('not.have.prop', 'beforeReload')
  })
})
