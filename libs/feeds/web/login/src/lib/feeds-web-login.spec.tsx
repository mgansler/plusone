import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { FeedsWebLogin } from './feeds-web-login'

describe('FeedsWebLogin', () => {
  const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  it('should render successfully', () => {
    const { baseElement } = render(
      <QueryClientProvider client={testQueryClient}>
        <FeedsWebLogin setToken={jest.fn()} />
      </QueryClientProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
