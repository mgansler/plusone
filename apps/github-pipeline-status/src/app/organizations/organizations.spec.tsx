import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { Organizations } from './organizations'

jest.mock('../octokit-provider/octokit-provider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useLogout: () => {},
  useOctokit: () => ({
    graphql: () => ({
      viewer: {
        organizations: {
          totalCount: 0,
          nodes: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
        },
      },
    }),
  }),
}))

describe('Organizations', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <Organizations />
      </QueryClientProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
