import { createTheme, ThemeProvider } from '@mui/material'
import { render } from '@testing-library/react'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Dishes } from './dishes'

describe('Dishes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={createTheme()}>
        <DinnerPlanStore>
          <Dishes />
        </DinnerPlanStore>
      </ThemeProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
