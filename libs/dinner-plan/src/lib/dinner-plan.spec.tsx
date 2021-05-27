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

    expect(screen.getByText(/kw \d\d/i)).toBeInTheDocument()
    expect(screen.getByText(/last week/i)).toBeInTheDocument()
    expect(screen.getByText(/this week/i)).toBeInTheDocument()
    expect(screen.getByText(/next week/i)).toBeInTheDocument()
  })
})
