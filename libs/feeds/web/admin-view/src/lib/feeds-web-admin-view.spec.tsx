import { createTheme, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

import { MockAuthenticationProvider } from '@plusone/feeds/web/login'

import { FeedsWebAdminView } from './feeds-web-admin-view'

describe('FeedsWebAdminView', () => {
  const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  it('should render successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={createTheme()}>
        <MockAuthenticationProvider>
          <QueryClientProvider client={testQueryClient}>
            <FeedsWebAdminView />
          </QueryClientProvider>
        </MockAuthenticationProvider>
      </ThemeProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
