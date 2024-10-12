describe('stgtrails-web-e2e', () => {
  beforeEach(() => cy.visit('/'))

  it('should render a svg', () => {
    cy.get('svg').should('be.visible')
  })

  it('should have a drop down with trail areas', () => {
    cy.findByRole('combobox', { name: 'Trail Area' }).should('be.visible')

    cy.findByRole('combobox', { name: 'Trail Area' }).select('Heslach West')
    cy.findByText('Klabuster').should('be.visible')
    cy.findByText('Saubuckel').should('be.visible')

    cy.findByRole('combobox', { name: 'Trail Area' }).select('Heslach Ost')
    cy.findByText('Schwälblesklinge').should('be.visible')
    cy.findByText('Geilbahn').should('be.visible')

    cy.findByRole('combobox', { name: 'Trail Area' }).select('Birkenkopf')
    cy.findByText('Mogli').should('be.visible')
    cy.findByText('King Louie').should('be.visible')

    cy.findByRole('combobox', { name: 'Trail Area' }).select('Solitude')
    cy.findByText('Jojo').should('be.visible')
    cy.findByText('Äffle und Pferdle').should('be.visible')
  })

  it('should have a drop down to select past days', () => {
    cy.findByRole('combobox', { name: 'Past days' }).should('be.visible')

    cy.intercept('GET', '/api/trailAreas/1/weather?hours=192&utcOffsetHours=0').as('getWeatherPast5Days')
    cy.intercept('GET', '/api/trailAreas/1/sunriseSunset?days=8').as('getSunriseSunsetPast5Days')
    cy.findByRole('combobox', { name: 'Past days' }).select('5 days')
    cy.wait('@getWeatherPast5Days')
    cy.wait('@getSunriseSunsetPast5Days')

    cy.intercept('GET', '/api/trailAreas/1/weather?hours=240&utcOffsetHours=0').as('getWeatherPast7Days')
    cy.intercept('GET', '/api/trailAreas/1/sunriseSunset?days=10').as('getSunriseSunsetPast7Days')
    cy.findByRole('combobox', { name: 'Past days' }).select('7 days')
    cy.wait('@getWeatherPast7Days')
    cy.wait('@getSunriseSunsetPast7Days')
  })
})
