import { mount } from '@cypress/react'

import { LoginCard } from './login-card'

describe('LoginCard', () => {
  it('should render the child', () => {
    mount(
      <LoginCard>
        <div>hello world</div>
      </LoginCard>,
    )

    cy.findByText(/hello world/i).should('be.visible')
  })
})
