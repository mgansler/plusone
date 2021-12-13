import { createTheme, ThemeProvider } from '@mui/material'
import { render } from '@testing-library/react'

import { LoginCard } from './login-card'

describe('LoginCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={createTheme()}>
        <LoginCard>
          <div>dummy child</div>
        </LoginCard>
      </ThemeProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
