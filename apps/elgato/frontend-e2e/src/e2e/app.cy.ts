describe('elgato-frontend', () => {
  beforeEach(() => cy.visit('/'))

  it('should render landing page', () => {
    cy.intercept('GET', '/api/devices', { fixture: 'devices.json' }).as('devices')
    cy.intercept('GET', '/api/devices/A8:98:97:CB:17:7F', { fixture: 'A8-98-97-CB-17-7F.json' }).as('A8-98-97-CB-17-7F')

    cy.findByRole('heading', { name: 'Welcome to Elgato Control' }).should('be.visible')
    cy.wait('@devices')
    cy.wait('@A8-98-97-CB-17-7F')
  })

  it('should handle a stuck device', () => {
    cy.intercept('GET', '/api/devices', { fixture: 'devices.json' }).as('devices')
    cy.intercept('GET', '/api/devices/A8:98:97:CB:17:7F', { statusCode: 500 }).as('A8-98-97-CB-17-7F')

    cy.wait('@devices')
    cy.wait('@A8-98-97-CB-17-7F')

    cy.findByRole('heading', { name: 'Welcome to Elgato Control' }).should('be.visible')
    cy.findByText('is stuck').should('be.visible')
    cy.findByRole('button', { name: 'Turn off' }).should('be.visible')
  })
})
