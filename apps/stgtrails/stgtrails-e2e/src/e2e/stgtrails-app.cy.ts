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

  it('should habe a drop down to select past days', () => {
    cy.findByRole('combobox', { name: 'Past days' }).should('be.visible')

    cy.intercept('GET', '/api/trailAreas/1/weather?hours=192').as('getPast5Days')
    cy.findByRole('combobox', { name: 'Past days' }).select('5 days')
    cy.wait('@getPast5Days')

    cy.intercept('GET', '/api/trailAreas/1/weather?hours=240').as('getPast7Days')
    cy.findByRole('combobox', { name: 'Past days' }).select('7 days')
    cy.wait('@getPast7Days')
  })
})
