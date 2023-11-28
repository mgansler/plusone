import { Lightbulb } from './lightbulb'

describe('size', () => {
  it('should have default size', () => {
    cy.mount(<Lightbulb variant={'outline'} />)
    cy.get('svg').should('have.css', 'height').and('eq', '24px')
    cy.get('svg').should('have.css', 'width').and('eq', '24px')
  })

  it('should have custom size', () => {
    cy.mount(<Lightbulb variant={'outline'} size={48} />)
    cy.get('svg').should('have.css', 'height').and('eq', '48px')
    cy.get('svg').should('have.css', 'width').and('eq', '48px')
  })
})
