// The search measures the distance to the midpoint of a route; this is the midpoint of the Hausrunde fixture
const HAUSRUNDE = { latitude: 48.7898, longitude: 9.2029 }

/** The midpoint of the Bergtour fixture is about 10.5 km away from the one of the Hausrunde */
const RADIUS_TO_REACH_BERGTOUR_KM = 15

/** Open /nearby with the browser located at `position`, so the search does not wait for a permission prompt */
function visitNearbyAt(position: { latitude: number; longitude: number }) {
  cy.visit('/nearby', {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (onFound: PositionCallback) => onFound({ coords: position } as GeolocationPosition),
        },
      })
    },
  })
}

/** Move the radius slider; React only notices a value set through the native setter followed by an input event */
function setRadius(km: number) {
  cy.findByLabelText(/^Radius:/).then(($slider) => {
    const slider = $slider[0] as HTMLInputElement
    const win = slider.ownerDocument.defaultView as Window & typeof globalThis
    Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value')?.set?.call(slider, String(km))
    slider.dispatchEvent(new win.Event('input', { bubbles: true }))
  })
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
    cy.findByRole('button', { name: 'Gefundene Routen' }).should('be.enabled')
    cy.findByRole('textbox', { name: 'Ort suchen' }).should('not.exist')
    cy.findByRole('dialog').should('not.exist')
  })

  it('shows the found routes in a sheet', () => {
    cy.findByRole('button', { name: 'Gefundene Routen' }).should('be.enabled').click()

    cy.findByRole('dialog', { name: 'Gefundene Routen' }).within(() => {
      cy.findByRole('heading', { name: '1 Routen gefunden' }).should('be.visible')
      cy.findByText('Hausrunde').click()
      cy.findByText('Strecke: 4.2 km').should('be.visible')
      cy.findByRole('button', { name: 'Schließen' }).click()
    })
    cy.findByRole('dialog', { name: 'Gefundene Routen' }).should('not.exist')
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

    cy.findByRole('button', { name: 'Gefundene Routen' }).click()
    cy.findByRole('dialog', { name: 'Gefundene Routen' }).within(() => {
      cy.findByRole('heading', { name: '2 Routen gefunden' }).should('be.visible')
      cy.findByText('Bergtour').should('be.visible')
    })
  })

  it('opens one sheet at a time', () => {
    cy.findByRole('button', { name: 'Gefundene Routen' }).should('be.enabled').click()
    cy.findByRole('dialog', { name: 'Gefundene Routen' }).should('be.visible')

    cy.findByRole('button', { name: 'Suche öffnen' }).click()

    cy.findByRole('dialog', { name: 'Suche' }).should('be.visible')
    cy.findByRole('dialog', { name: 'Gefundene Routen' }).should('not.exist')
  })

  it('compares routes found nearby and returns to the search', () => {
    cy.findByRole('button', { name: 'Suche öffnen' }).click()
    setRadius(RADIUS_TO_REACH_BERGTOUR_KM)
    cy.findByRole('button', { name: 'Suche schließen' }).click()

    cy.findByRole('button', { name: 'Gefundene Routen' }).click()
    cy.findByRole('dialog', { name: 'Gefundene Routen' }).within(() => {
      cy.findByRole('heading', { name: '2 Routen gefunden' }).should('be.visible')
      cy.findAllByRole('button', { name: '+ Vergleich' })
        .should('have.length', 2)
        .each(($button) => cy.wrap($button).click())
      cy.findByLabelText('Vergleichsliste').within(() => {
        cy.findByText('Vergleich (2)').should('be.visible')
        cy.findByRole('link', { name: 'Vergleichen →' }).click()
      })
    })

    cy.location('pathname').should('eq', '/compare')
    cy.findByRole('link', { name: '← Zurück' }).should('be.visible')
    cy.findByRole('heading', { name: 'Routenvergleich' }).should('not.exist')

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
    cy.location('pathname').should('eq', '/nearby')
  })
})
