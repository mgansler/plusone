import { createTheme, ThemeProvider } from '@mui/material'

import { LoginCard } from './login-card'

describe('LoginCard', () => {
  it('should render the child', () => {
    cy.mount(
      <ThemeProvider theme={createTheme()}>
        <LoginCard>
          <div>hello world</div>
        </LoginCard>
      </ThemeProvider>,
    )

    cy.findByText(/hello world/i).should('be.visible')
  })
})
