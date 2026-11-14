import { HAUSRUNDE, RADIUS_TO_REACH_BERGTOUR_KM, setRadius, visitRoutesAt } from '../support/nearby-helpers'

/** Open /nearby with the browser located at `position`, so the search does not wait for a permission prompt */
function visitNearbyAt(position: { latitude: number; longitude: number }) {
  visitRoutesAt(position)
}

function uploadRoutes() {
  // Any page of the app will do to get a window with the login for the upload
  cy.visitLoggedIn('/settings')
  cy.uploadRoute('hausrunde.gpx')
  cy.uploadRoute('bergtour.gpx')
}

describe('nearby routes on desktop', () => {
  beforeEach(() => {
    uploadRoutes()
    visitNearbyAt(HAUSRUNDE)
  })

  it('lists the routes in the sidebar next to the map', () => {
    cy.findByRole('heading', { name: 'Routen in der Nähe' }).should('be.visible')
    cy.findByRole('heading', { name: '1 Routen gefunden' }).should('be.visible')
    cy.findByText('Hausrunde').should('be.visible')
    cy.findByRole('button', { name: 'Suche öffnen' }).should('not.exist')
    cy.findByRole('dialog').should('not.exist')

    cy.findByText('Hausrunde').click()
    cy.findByText('Strecke: 4.2 km').should('be.visible')
  })

  it('finds more routes with a larger radius', () => {
    setRadius(RADIUS_TO_REACH_BERGTOUR_KM)

    cy.findByRole('heading', { name: '2 Routen gefunden' }).should('be.visible')
    cy.findByText('Bergtour').should('be.visible')
  })
})

describe('nearby routes on mobile', () => {
  beforeEach(() => {
    cy.viewport(390, 844)
    uploadRoutes()
    visitNearbyAt(HAUSRUNDE)
  })

  it('shows only the map until a sheet is opened', () => {
    cy.findByRole('button', { name: 'Ergebnisse' }).should('be.enabled')
    cy.findByRole('textbox', { name: 'Ort suchen' }).should('not.exist')
    cy.findByRole('dialog').should('not.exist')
  })

  it('shows the found routes in a sheet', () => {
    cy.findByRole('button', { name: 'Ergebnisse' }).should('be.enabled').click()

    cy.findByRole('dialog', { name: 'Ergebnisse' }).within(() => {
      cy.findByRole('heading', { name: '1 Routen gefunden' }).should('be.visible')
      cy.findByText('Hausrunde').click()
      cy.findByText('Strecke: 4.2 km').should('be.visible')
      cy.findByRole('button', { name: 'Schließen' }).click()
    })
    cy.findByRole('dialog', { name: 'Ergebnisse' }).should('not.exist')
  })

  it('searches in a sheet and finds more routes with a larger radius', () => {
    cy.findByRole('button', { name: 'Suche öffnen' }).click()
    cy.findByRole('dialog', { name: 'Suche' }).within(() => {
      cy.findByRole('textbox', { name: 'Ort suchen' }).should('be.visible')
      cy.findByLabelText('Radius: 2 km').should('be.visible')
    })
    setRadius(RADIUS_TO_REACH_BERGTOUR_KM)
    cy.findByLabelText(`Radius: ${RADIUS_TO_REACH_BERGTOUR_KM} km`).should('be.visible')

    cy.findByRole('button', { name: 'Suche schließen' }).click()
    cy.findByRole('dialog', { name: 'Suche' }).should('not.exist')

    cy.findByRole('button', { name: 'Ergebnisse' }).click()
    cy.findByRole('dialog', { name: 'Ergebnisse' }).within(() => {
      cy.findByRole('heading', { name: '2 Routen gefunden' }).should('be.visible')
      cy.findByText('Bergtour').should('be.visible')
    })
  })

  it('opens one sheet at a time', () => {
    cy.findByRole('button', { name: 'Ergebnisse' }).should('be.enabled').click()
    cy.findByRole('dialog', { name: 'Ergebnisse' }).should('be.visible')

    cy.findByRole('button', { name: 'Suche öffnen' }).click()

    cy.findByRole('dialog', { name: 'Suche' }).should('be.visible')
    cy.findByRole('dialog', { name: 'Ergebnisse' }).should('not.exist')
  })

  it('compares routes found nearby and returns to the search', () => {
    cy.findByRole('button', { name: 'Suche öffnen' }).click()
    setRadius(RADIUS_TO_REACH_BERGTOUR_KM)
    cy.findByRole('button', { name: 'Suche schließen' }).click()

    cy.findByRole('button', { name: 'Ergebnisse' }).click()
    cy.findByRole('dialog', { name: 'Ergebnisse' }).within(() => {
      cy.findByRole('heading', { name: '2 Routen gefunden' }).should('be.visible')
      cy.findAllByRole('button', { name: '+ Vergleich' })
        .should('have.length', 2)
        .each(($button) => cy.wrap($button).click())
      cy.findByRole('region', { name: 'Vergleich' }).within(() => {
        cy.findByText('Vergleich (2)').should('be.visible')
        cy.findByRole('link', { name: 'Vergleich →' }).click()
      })
    })

    cy.location('pathname').should('eq', '/compare')
    cy.findByRole('link', { name: '← Zurück' }).should('be.visible')
    cy.findByRole('heading', { name: 'Vergleich' }).should('not.exist')

    // The route list and the elevation profile are sheets of their own
    cy.findByRole('dialog', { name: 'Routenliste' }).should('not.exist')
    cy.findByRole('button', { name: 'Routen' }).click()
    cy.findByRole('dialog', { name: 'Routenliste' }).within(() => {
      cy.findByRole('link', { name: 'Hausrunde' }).should('be.visible')
      cy.findByRole('link', { name: 'Bergtour' }).should('be.visible')
    })
    cy.findByRole('button', { name: 'Höhenprofil' }).click()
    cy.findByRole('dialog', { name: 'Höhenprofil' }).should('be.visible')

    cy.findByRole('link', { name: '← Zurück' }).click()
    cy.location('pathname').should('eq', '/routes')
  })
})
