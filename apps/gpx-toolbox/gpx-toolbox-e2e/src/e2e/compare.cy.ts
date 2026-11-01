describe('comparing routes', () => {
  beforeEach(() => {
    cy.visitLoggedIn('/')
    cy.uploadRoute('hausrunde.gpx')
    cy.uploadRoute('bergtour.gpx')
    cy.reload()
  })

  it('compares routes selected in the route list', () => {
    cy.findByRole('link', { name: /Hausrunde/ }).within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())
    cy.findByText('Mindestens eine weitere Route hinzufügen').should('be.visible')
    cy.findByRole('link', { name: /Bergtour/ }).within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())

    // The selection survives a reload
    cy.reload()
    cy.findByLabelText('Vergleichsliste').within(() => {
      cy.findByText('Vergleich (2)').should('be.visible')
      cy.findByRole('link', { name: 'Vergleichen →' }).click()
    })

    cy.location('pathname').should('eq', '/compare')
    cy.findByRole('heading', { name: 'Routenvergleich' }).should('be.visible')
    cy.get('tbody tr').should('have.length', 2)
    cy.get('tbody tr').first().should('contain', 'Hausrunde').and('contain', 'Referenz')
    // Differences are relative to the reference
    cy.get('tbody tr').last().should('contain', 'Bergtour').and('contain', '+')

    cy.findByRole('button', { name: 'Als Referenz' }).click()
    cy.get('tbody tr').first().should('contain', 'Bergtour').and('contain', 'Referenz')

    cy.findByRole('button', { name: 'Hausrunde aus dem Vergleich entfernen' }).click()
    cy.get('tbody tr').should('have.length', 1)
    cy.findByText(/Füge mindestens zwei Routen/).should('be.visible')
  })

  it('shows a removed route as not found', () => {
    cy.findByRole('link', { name: /Hausrunde/ }).within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())
    cy.findByRole('link', { name: /Bergtour/ }).within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())
    cy.task('db:reset')
    cy.visitLoggedIn('/compare')

    cy.findAllByText('Route nicht gefunden').should('have.length', 2)
    cy.findByRole('button', { name: 'Vergleichsliste leeren' }).click()
    cy.get('table').should('not.exist')
  })
})
