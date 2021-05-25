import { render } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Day } from './day'

describe('Day', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DinnerPlanStore>
        <MemoryRouter initialEntries={['/2021/01']}>
          <Route exact={true} path={'/:year/:week'}>
            <Day dayOfWeek={1} />
          </Route>
        </MemoryRouter>
        ,
      </DinnerPlanStore>,
    )
    expect(baseElement).toBeTruthy()
  })
})
