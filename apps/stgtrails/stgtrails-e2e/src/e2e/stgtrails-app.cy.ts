describe('stgtrails-web-e2e', () => {
  beforeEach(() => cy.visit('/'))

  it('should render a canvas', () => {
    cy.get('canvas').should('be.visible')
  })

  it('should have a drop down with trail areas', () => {
    cy.findByRole('combobox').should('be.visible')

    cy.findByRole('combobox').select('Heslach West')
    cy.findByText('Klabuster').should('be.visible')
    cy.findByText('Saubuckel').should('be.visible')

    cy.findByRole('combobox').select('Heslach Ost')
    cy.findByText('Schwälblesklinge').should('be.visible')
    cy.findByText('Geilbahn').should('be.visible')

    cy.findByRole('combobox').select('Birkenkopf')
    cy.findByText('Mogli').should('be.visible')
    cy.findByText('King Louie').should('be.visible')

    cy.findByRole('combobox').select('Solitude')
    cy.findByText('Jojo').should('be.visible')
    cy.findByText('Äffle und Pferdle').should('be.visible')
  })
})
