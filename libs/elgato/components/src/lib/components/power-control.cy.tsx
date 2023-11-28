import { PowerControl } from './power-control'

describe('Power Control', () => {
  it('should call onClick handler', () => {
    const onClick = cy.spy().as('onClick')
    cy.mount(<PowerControl state={'on'} onClick={onClick} />)
    cy.findByRole('button').click()
    cy.get('@onClick').should('have.been.calledOnce')
  })

  it('should use solid icon when on', () => {
    const onClick = cy.spy().as('onClick')
    cy.mount(<PowerControl state={'on'} onClick={onClick} />)
    cy.get('svg').should('have.attr', 'name').and('eq', 'lightbulb-solid')
  })

  it('should use outline icon when off', () => {
    const onClick = cy.spy().as('onClick')
    cy.mount(<PowerControl state={'off'} onClick={onClick} />)
    cy.get('svg').should('have.attr', 'name').and('eq', 'lightbulb-outline')
  })
})
