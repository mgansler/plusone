import { render } from '@testing-library/react'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Dishes } from './dishes'

describe('Dishes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DinnerPlanStore>
        <Dishes />
      </DinnerPlanStore>,
    )
    expect(baseElement).toBeTruthy()
  })
})
