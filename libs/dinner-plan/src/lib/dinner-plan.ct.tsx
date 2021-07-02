import { MemoryRouter } from 'react-router-dom'
import { mount } from '@cypress/react'

import { DinnerPlan } from './dinner-plan'

describe('DinnerPlan', () => {
  it('should render successfully', () => {
    mount(
      <MemoryRouter>
        <DinnerPlan />
      </MemoryRouter>,
    )
  })
})
