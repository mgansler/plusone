import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import nock from 'nock'
import { MemoryRouter } from 'react-router-dom'

import { Organizations } from './organizations'

jest.mock('../octokit-provider/octokit-provider')

describe('Organizations', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should render successfully with empty result', async () => {
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

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organizations/myorg']}>
          <Organizations />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })
  })

  it('should render successfully with an entry', async () => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          viewer: {
            organizations: {
              totalCount: 1,
              nodes: [{ id: 'organization-id', name: 'organization-name' }],
              pageInfo: {
                endCursor: 'cursor',
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: 'cursor',
              },
            },
          },
        },
      })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organizations/myorg']}>
          <Organizations />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })

    expect(screen.getByText('organization-name')).toBeInTheDocument()
  })
})
