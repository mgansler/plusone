describe('activity upload', () => {
  it('links an uploaded activity to the matching route', () => {
    cy.visitLoggedIn('/')
    cy.uploadRoute('hausrunde.gpx')
    cy.uploadActivity('hausrunde.gpx', 'Feierabendrunde')

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

  it('creates a new route for an activity without a matching route', () => {
    cy.visitLoggedIn('/')
    cy.uploadActivity('bergtour.gpx', 'Bergtour')

    cy.visit('/activities')
    cy.findByRole('heading', { name: 'Aktivitäten (1)' }).should('be.visible')
    // The title of the activity and the name of its new route
    cy.findAllByText('Bergtour').should('have.length', 2)

    cy.visit('/')
    cy.findByRole('heading', { name: 'Routen (1)' }).should('be.visible')
  })

  it('does not offer a Strava import any more', () => {
    cy.visitLoggedIn('/activities')

    cy.findByRole('button', { name: /Upload/ }).should('be.visible')
    cy.findByRole('link', { name: /Sync/ }).should('not.exist')
    cy.request({ url: '/api/import/strava/routes', failOnStatusCode: false })
      .its('status')
      .should('be.oneOf', [401, 404])
  })
})
