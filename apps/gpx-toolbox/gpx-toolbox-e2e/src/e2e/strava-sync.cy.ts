import { MATCHING_ACTIVITY, VIRTUAL_ACTIVITY } from '../support/strava-mock'

describe('Strava sync', () => {
  it('imports a Strava activity and links it to the matching route', () => {
    cy.visitLoggedIn('/')
    cy.uploadRoute('hausrunde.gpx')
    cy.visit('/activities/sync')

    cy.findByRole('button', { name: '🔄 Aktualisieren' }).click()
    cy.findByText(MATCHING_ACTIVITY.name).should('be.visible')
    cy.findByText(VIRTUAL_ACTIVITY.name).should('be.visible')
    cy.findByText('2 geladen').should('be.visible')
    cy.findByText('0 importiert').should('be.visible')

    cy.findByRole('button', { name: `${MATCHING_ACTIVITY.name} importieren` }).click()

    cy.findByText('1 importiert').should('be.visible')
    cy.findByRole('button', { name: `${MATCHING_ACTIVITY.name} ist bereits importiert` }).should('be.disabled')
    cy.findByRole('button', { name: `${VIRTUAL_ACTIVITY.name} importieren` }).should('be.enabled')

    // The activity was matched to the uploaded route instead of creating a new one
    cy.visit('/')
    cy.findByRole('heading', { name: 'Routen (1)' }).should('be.visible')
    cy.findByRole('link', { name: /Hausrunde/ }).within(() => {
      cy.findByText('Gefahren').should('be.visible')
      cy.findByText('1 Aktivitäten').should('be.visible')
    })
    cy.findByRole('link', { name: /Hausrunde/ }).click()
    cy.findByRole('heading', { name: 'Aktivitäten (1)' }).should('be.visible')
  })
})
