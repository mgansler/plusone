import { HAUSRUNDE, RADIUS_TO_REACH_BERGTOUR_KM, setRadius, visitRoutesAt } from '../support/nearby-helpers'

describe('comparing routes', () => {
  beforeEach(() => {
    cy.visitLoggedIn('/settings')
    cy.uploadRoute('hausrunde.gpx')
    cy.uploadRoute('bergtour.gpx')
    visitRoutesAt(HAUSRUNDE)
    // Expand radius to find both routes
    setRadius(RADIUS_TO_REACH_BERGTOUR_KM)
    cy.findByText('2 Routen gefunden').should('be.visible')
  })

  it('compares routes selected in the nearby results', () => {
    cy.findByText('Hausrunde')
      .parent()
      .within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())
    cy.findByText('Füge Routen hinzu, um sie zu vergleichen.').should('be.visible')
    cy.findByText('Bergtour')
      .parent()
      .within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())

    // The selection survives a reload
    cy.reload()
    // Re-set radius after reload
    setRadius(RADIUS_TO_REACH_BERGTOUR_KM)
    cy.findByRole('region', { name: 'Vergleich' }).within(() => {
      cy.findByText('Vergleich (2)').should('be.visible')
      cy.findByRole('link', { name: 'Vergleich →' }).click()
    })

    cy.location('pathname').should('eq', '/compare')
    cy.findByRole('heading', { name: 'Vergleich' }).should('be.visible')
    // The first row holds the column headings
    cy.findAllByRole('row').should('have.length', 3)
    cy.findAllByRole('row').eq(1).should('contain', 'Hausrunde').and('contain', 'Referenz')
    // Differences are relative to the reference
    cy.findAllByRole('row').eq(2).should('contain', 'Bergtour').and('contain', '+')

    cy.findByRole('button', { name: 'Als Referenz' }).click()
    cy.findAllByRole('row').eq(1).should('contain', 'Bergtour').and('contain', 'Referenz')

    cy.findByRole('button', { name: 'Hausrunde aus dem Vergleich entfernen' }).click()
    cy.findAllByRole('row').should('have.length', 2)
    cy.findByText(/Füge mindestens zwei Routen/).should('be.visible')
  })

  it('shows a removed route as not found', () => {
    cy.findByText('Hausrunde')
      .parent()
      .within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())
    cy.findByText('Bergtour')
      .parent()
      .within(() => cy.findByRole('button', { name: '+ Vergleich' }).click())
    cy.task('db:reset')
    cy.visitLoggedIn('/compare')

    cy.findAllByText('Route nicht gefunden').should('have.length', 2)
    cy.findByRole('button', { name: 'Vergleichsliste leeren' }).click()
    cy.findByRole('table').should('not.exist')
  })
})
