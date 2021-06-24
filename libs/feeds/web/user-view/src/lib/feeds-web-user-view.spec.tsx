import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { MockAuthenticationProvider } from '@plusone/feeds/web/login'

import { FeedsWebUserView } from './feeds-web-user-view'

describe('FeedsWebUserView', () => {
  const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockAuthenticationProvider>
        <QueryClientProvider client={testQueryClient}>
          <FeedsWebUserView />
        </QueryClientProvider>
      </MockAuthenticationProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
