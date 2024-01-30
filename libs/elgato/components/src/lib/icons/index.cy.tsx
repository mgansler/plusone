import { Lightbulb } from './lightbulb'
import { TrashBin } from './trash-bin'

describe('Icons', () => {
  const components = [
    { component: <Lightbulb variant={'outline'} />, name: 'lightbulb' },
    { component: <TrashBin variant={'outline'} />, name: 'trash-bin' },
  ]

  components.forEach(({ component, name }) => {
    it(`should have default size (${name})`, () => {
      cy.mount(component)
      cy.get('svg').should('have.css', 'height').and('eq', '24px')
      cy.get('svg').should('have.css', 'width').and('eq', '24px')
    })

    it(`should have custom size (${name})`, () => {
      cy.mount(<Lightbulb variant={'outline'} size={48} />)
      cy.get('svg').should('have.css', 'height').and('eq', '48px')
      cy.get('svg').should('have.css', 'width').and('eq', '48px')
    })
  })
})
