import { render, screen } from '@testing-library/react'

import { DinnerPlan } from './dinner-plan'

describe('DinnerPlan', () => {
  it('should render successfully', () => {
    render(<DinnerPlan />)
    expect(screen.getByText('Welcome to dinner-plan!')).toBeInTheDocument()
  })
})
