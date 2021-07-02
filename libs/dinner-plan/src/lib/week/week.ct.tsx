import { mount } from '@cypress/react'
import { MemoryRouter } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Week } from './week'

describe('Week', () => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  it('should render a complete week', () => {
    mount(
      <DinnerPlanStore>
        <MemoryRouter>
          <Week />
        </MemoryRouter>
      </DinnerPlanStore>,
    )

    weekDays.forEach((day) => cy.findByText(day).should('be.visible'))
  })
})
