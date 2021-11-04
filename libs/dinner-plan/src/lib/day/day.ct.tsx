import { mount } from '@cypress/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Day } from './day'

describe('Day', () => {
  const testCases = [
    { dayOfWeek: 1, day: 'Monday' },
    { dayOfWeek: 2, day: 'Tuesday' },
    { dayOfWeek: 3, day: 'Wednesday' },
    { dayOfWeek: 4, day: 'Thursday' },
    { dayOfWeek: 5, day: 'Friday' },
    { dayOfWeek: 6, day: 'Saturday' },
    { dayOfWeek: 7, day: 'Sunday' },
  ]

  testCases.forEach(({ day, dayOfWeek }) =>
    it(`should render '${day}' for given dayOfWeek='${dayOfWeek}'`, () => {
      mount(
        <DinnerPlanStore>
          <MemoryRouter initialEntries={['/2021/01']}>
            <Routes>
              <Route path={'/:year/:week'} element={<Day dayOfWeek={dayOfWeek} />} />
            </Routes>
          </MemoryRouter>
        </DinnerPlanStore>,
      )

      cy.findByText(day).should('be.visible')
    }),
  )
})
