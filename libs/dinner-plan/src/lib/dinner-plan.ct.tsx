import { mount } from '@cypress/react'
import { createTheme, ThemeProvider } from '@mui/material'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DinnerPlan } from './dinner-plan'

describe('DinnerPlan', () => {
  it('should render successfully', () => {
    mount(
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter initialEntries={['/dinner-plan']}>
          <Routes>
            <Route path={'/dinner-plan/*'} element={<DinnerPlan />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    cy.findByText(/kw \d{1,2}/i).should('be.visible')
    cy.findByText(/last week/i).should('be.visible')
    cy.findByText(/this week/i).should('be.visible')
    cy.findByText(/next week/i).should('be.visible')
  })
})
