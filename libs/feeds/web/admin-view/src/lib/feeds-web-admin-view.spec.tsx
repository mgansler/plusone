import { createTheme, ThemeProvider } from '@mui/material'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

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
