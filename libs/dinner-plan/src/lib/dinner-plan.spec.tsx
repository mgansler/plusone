import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { DinnerPlan } from './dinner-plan'

describe('DinnerPlan', () => {
  it('should render successfully', () => {
    render(
      <MemoryRouter>
        <DinnerPlan />
      </MemoryRouter>,
    )

    expect(screen.getByText('Welcome to dinner-plan!')).toBeInTheDocument()
  })
})
