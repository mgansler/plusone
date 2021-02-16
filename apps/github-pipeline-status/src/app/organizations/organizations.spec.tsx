import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import nock from 'nock'

import { Organizations } from './organizations'

jest.mock('../octokit-provider/octokit-provider')

describe('Organizations', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should render successfully', async () => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
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
        },
      })

    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <Organizations />
      </QueryClientProvider>,
    )

    expect(baseElement).toBeTruthy()
    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
