import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import nock from 'nock'

import { RepositoryOverview } from './repository-overview'

jest.mock('../octokit-provider/octokit-provider')

describe('RepositoryOverview', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should render successfully', async () => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          search: {
            repositoryCount: 2,
            pageInfo: {
              endCursor: 'endCursor',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: 'startCursor',
            },
            nodes: [
              {
                name: 'repo 1',
                id: '1',
              },
              { name: 'repo 2', id: '2' },
            ],
          },
        },
      })

    render(
      <QueryClientProvider client={queryClient}>
        <RepositoryOverview organizationName={'someOrganization'} />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })

    expect(screen.getByText(/repo 1/i)).toBeInTheDocument()
    expect(screen.getByText(/repo 2/i)).toBeInTheDocument()
  })
})
