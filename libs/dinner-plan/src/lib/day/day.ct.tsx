import { mount } from '@cypress/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Day } from './day'

describe('Day', () => {
  const testCases = [
    { day: 'Monday', dayOfWeek: 1 },
    { day: 'Tuesday', dayOfWeek: 2 },
    { day: 'Wednesday', dayOfWeek: 3 },
    { day: 'Thursday', dayOfWeek: 4 },
    { day: 'Friday', dayOfWeek: 5 },
    { day: 'Saturday', dayOfWeek: 6 },
    { day: 'Sunday', dayOfWeek: 7 },
  ]

  testCases.forEach(({ day, dayOfWeek }) =>
    it(`should render '${day}' for given dayOfWeek='${dayOfWeek}'`, () => {
      mount(
        <DinnerPlanStore>
          <MemoryRouter initialEntries={['/2021/01']}>
            <Route exact={true} path={'/:year/:week'}>
              <Day dayOfWeek={dayOfWeek} />
            </Route>
          </MemoryRouter>
        </DinnerPlanStore>,
      )

      cy.findByText(day).should('be.visible')
    }),
  )
})
