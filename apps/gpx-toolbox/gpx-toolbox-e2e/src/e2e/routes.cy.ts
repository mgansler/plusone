import { authHeaders } from '../support/commands'

const HAUSRUNDE = { latitude: 48.7898, longitude: 9.2029 }
const BERGTOUR = { latitude: 48.7316, longitude: 9.3158 }

function visitRoutesAt(position: { latitude: number; longitude: number }) {
  cy.visit('/routes', {
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

describe('routes', () => {
  it('uploads a GPX file and shows the route in the nearby results', () => {
    cy.visitLoggedIn('/settings')
    cy.uploadRoute('hausrunde.gpx', 'Meine Hausrunde')

    visitRoutesAt(HAUSRUNDE)
    cy.findByRole('heading', { name: 'Routen in der Nähe' }).should('be.visible')
    cy.findByText('1 Routen gefunden').should('be.visible')
    cy.findByText('Meine Hausrunde').should('be.visible')
    cy.findByText('Meine Hausrunde').click()
    cy.findByText('Strecke: 4.2 km').should('be.visible')
  })

  it('uses the track name when no name is given', () => {
    cy.visitLoggedIn('/settings')
    cy.uploadRoute('bergtour.gpx')

    visitRoutesAt(BERGTOUR)
    cy.findByRole('heading', { name: 'Routen in der Nähe' }).should('be.visible')
    cy.findByText('Bergtour').should('be.visible')
  })

  it('shows the details, the activities and exports the route', () => {
    cy.visitLoggedIn('/settings')
    cy.uploadRoute('hausrunde.gpx').then((routeId) => {
      cy.request({
        method: 'POST',
        url: `/api/routes/${routeId}/activities`,
        headers: authHeaders(),
        body: { riddenAt: '2024-06-01', title: 'Erste Runde', duration: 1200 },
      })
      cy.visit(`/routes/${routeId}`)
    })

    cy.url().should('include', '/routes/')

    cy.findByRole('heading', { name: 'Hausrunde' }).should('be.visible')
    cy.findByRole('heading', { name: 'Aktivitäten (1)' }).should('be.visible')
    cy.findByText('1.6.2024').should('be.visible')

    // The first export button exports the full track, the second one the selected segment
    cy.findAllByRole('button', { name: 'GPX' }).first().click()
    cy.readFile(`${Cypress.config('downloadsFolder')}/Hausrunde.gpx`).should('contain', '<trkpt')
  })

  it('deletes a route together with its activities after confirmation', () => {
    cy.visitLoggedIn('/settings')
    cy.uploadRoute('hausrunde.gpx').then((routeId) => {
      cy.request({
        method: 'POST',
        url: `/api/routes/${routeId}/activities`,
        headers: authHeaders(),
        body: { riddenAt: '2024-06-01' },
      })
      cy.visit(`/routes/${routeId}`)
    })

    cy.findByRole('button', { name: '🗑 Route löschen' }).click()
    cy.findByRole('dialog', { name: 'Route löschen' }).within(() => {
      cy.findByText('„Hausrunde“ wird endgültig gelöscht, die zugehörige Aktivität ebenfalls.').should('be.visible')
      cy.findByRole('button', { name: 'Abbrechen' }).click()
    })
    cy.findByRole('dialog').should('not.exist')

    cy.findByRole('button', { name: '🗑 Route löschen' }).click()
    cy.findByRole('dialog', { name: 'Route löschen' }).within(() =>
      cy.findByRole('button', { name: 'Löschen' }).click(),
    )

    cy.location('pathname').should('eq', '/routes')
    cy.request({ url: '/api/activities', headers: authHeaders() }).its('body.total').should('eq', 0)
  })
})
