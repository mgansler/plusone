import { render } from '@testing-library/react'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Ingredients } from './ingredients'

describe('Ingredients', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DinnerPlanStore>
        <Ingredients />
      </DinnerPlanStore>,
    )
    expect(baseElement).toBeTruthy()
  })
})
