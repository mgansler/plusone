import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Week } from './week'

describe('Week', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DinnerPlanStore>
        <MemoryRouter>
          <Week />
        </MemoryRouter>
      </DinnerPlanStore>,
    )
    expect(baseElement).toBeTruthy()
  })
})
