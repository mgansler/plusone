import { mount } from '@cypress/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Week } from './week'

describe('Week', () => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  it('should render a complete week', () => {
    mount(
      <DinnerPlanStore>
        <MemoryRouter initialEntries={['/2021/13']}>
          <Routes>
            <Route path={':year/:week'} element={<Week />} />
          </Routes>
        </MemoryRouter>
      </DinnerPlanStore>,
    )

    weekDays.forEach((day) => cy.findByText(day).should('be.visible'))
  })
})
