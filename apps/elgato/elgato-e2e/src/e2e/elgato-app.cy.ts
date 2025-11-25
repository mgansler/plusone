describe('elgato-web', () => {
  it('should render landing page', () => {
    cy.intercept('GET', '/api/devices', { fixture: 'devices.json' }).as('devices')
    cy.intercept('GET', '/api/devices/ma:ca:dd:re:ss', { fixture: 'device-details.json' }).as('deviceDetails')

    cy.visit('/')

    cy.findByRole('heading', { name: 'Elgato Control' }).should('be.visible')
    cy.wait('@devices')
    cy.wait('@deviceDetails')
  })

  it('should handle a stuck device', () => {
    cy.intercept('GET', '/api/devices', { fixture: 'devices.json' }).as('devices')
    cy.intercept('GET', '/api/devices/ma:ca:dd:re:ss', { statusCode: 500 }).as('deviceDetails')

    cy.visit('/')

    cy.wait('@devices')
    cy.wait('@deviceDetails')

    cy.findByRole('heading', { name: 'Elgato Control' }).should('be.visible')
    cy.findByText('is stuck').should('be.visible')
    cy.findByRole('button', { name: 'Turn off' }).should('be.visible')
  })
})
