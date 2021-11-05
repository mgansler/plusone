import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { mount } from '@cypress/react'

import { DinnerPlan } from './dinner-plan'

describe('DinnerPlan', () => {
  it('should render successfully', () => {
    mount(
      <MemoryRouter initialEntries={['/dinner-plan']}>
        <Routes>
          <Route path={'/dinner-plan/*'} element={<DinnerPlan />} />
        </Routes>
      </MemoryRouter>,
    )

    cy.findByText(/kw \d\d/i).should('be.visible')
    cy.findByText(/last week/i).should('be.visible')
    cy.findByText(/this week/i).should('be.visible')
    cy.findByText(/next week/i).should('be.visible')
  })
})
