import { authHeaders } from '../support/commands'

describe('routes', () => {
  it('uploads a GPX file and shows the route', () => {
    cy.visitLoggedIn('/')
    cy.findByRole('heading', { name: 'Routen (0)' }).should('be.visible')

    cy.findByRole('button', { name: '📤 Upload' }).click()
    cy.findByRole('dialog', { name: 'Route hochladen' }).within(() => {
      cy.get('input[type=file]').selectFile('src/fixtures/hausrunde.gpx', { force: true })
      cy.findByPlaceholderText('Name (optional, sonst aus GPX)').type('Meine Hausrunde')
      cy.findByRole('button', { name: 'Hochladen' }).click()
    })

    cy.findByRole('dialog').should('not.exist')
    cy.findByRole('heading', { name: 'Routen (1)' }).should('be.visible')
    cy.findByRole('link', { name: /Meine Hausrunde/ }).within(() => {
      cy.findByText('4.2 km').should('be.visible')
      cy.findByText('111 hm').should('be.visible')
      cy.findByText('Manuell').should('be.visible')
      cy.findByText('Geplant').should('be.visible')
    })
  })

  it('uses the track name when no name is given', () => {
    cy.visitLoggedIn('/')

    cy.findByRole('button', { name: '📤 Upload' }).click()
    cy.get('input[type=file]').selectFile('src/fixtures/bergtour.gpx', { force: true })
    cy.findByRole('button', { name: 'Hochladen' }).click()

    cy.findByRole('link', { name: /Bergtour/ }).should('be.visible')
  })

  it('shows the details, the activities and exports the route', () => {
    cy.visitLoggedIn('/')
    cy.uploadRoute('hausrunde.gpx').then((routeId) => {
      cy.request({
        method: 'POST',
        url: `/api/routes/${routeId}/activities`,
        headers: authHeaders(),
        body: { riddenAt: '2024-06-01', title: 'Erste Runde', duration: 1200 },
      })
    })
    cy.reload()

    cy.findByRole('link', { name: /Hausrunde/ }).within(() => cy.findByText('1 Aktivitäten').should('be.visible'))
    cy.findByRole('link', { name: /Hausrunde/ }).click()

    cy.findByRole('heading', { name: 'Hausrunde' }).should('be.visible')
    cy.findByRole('heading', { name: 'Aktivitäten (1)' }).should('be.visible')
    cy.findByText('1.6.2024').should('be.visible')

    // The first export button exports the full track, the second one the selected segment
    cy.findAllByRole('button', { name: 'GPX' }).first().click()
    cy.readFile(`${Cypress.config('downloadsFolder')}/Hausrunde.gpx`).should('contain', '<trkpt')
  })

  it('deletes a route together with its activities after confirmation', () => {
    cy.visitLoggedIn('/')
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

    cy.location('pathname').should('eq', '/')
    cy.findByRole('heading', { name: 'Routen (0)' }).should('be.visible')
    cy.request({ url: '/api/activities', headers: authHeaders() }).its('body.total').should('eq', 0)
  })
})
