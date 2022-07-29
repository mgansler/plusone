import { createTheme, ThemeProvider } from '@mui/material'
import { mount } from 'cypress/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Week } from './week'

describe('Week', () => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  it('should render a complete week', () => {
    mount(
      <ThemeProvider theme={createTheme()}>
        <DinnerPlanStore>
          <MemoryRouter initialEntries={['/2021/13']}>
            <Routes>
              <Route path={':year/:week'} element={<Week />} />
            </Routes>
          </MemoryRouter>
        </DinnerPlanStore>
      </ThemeProvider>,
    )

    weekDays.forEach((day) => cy.findByText(day).should('be.visible'))
  })
})
