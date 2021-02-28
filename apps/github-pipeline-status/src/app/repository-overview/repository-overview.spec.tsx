import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import nock from 'nock'
import { BrowserRouter } from 'react-router-dom'
import { CheckConclusionState } from '@plusone/github-schema'

import { RepositoryOverview } from './repository-overview'

jest.mock('../octokit-provider/octokit-provider')

describe('RepositoryOverview', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should fetch data and render successfully', async () => {
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
                url: 'http://localhost/repo-1',
                defaultBranchRef: {
                  name: 'main',
                  target: {
                    checkSuites: {
                      nodes: [{ conclusion: CheckConclusionState.Success }],
                    },
                  },
                },
                pullRequests: {
                  totalCount: 1,
                  nodes: [
                    {
                      commits: {
                        totalCount: 1,
                        nodes: [
                          {
                            commit: {
                              checkSuites: {
                                nodes: [
                                  { conclusion: CheckConclusionState.Success },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                name: 'repo 2',
                id: '2',
                url: 'http://localhost/repo-2',
                defaultBranchRef: {
                  name: 'develop',
                  target: {
                    checkSuites: {
                      nodes: [{ conclusion: CheckConclusionState.Neutral }],
                    },
                  },
                },
                pullRequests: {
                  totalCount: 0,
                  nodes: [],
                },
              },
            ],
          },
        },
      })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RepositoryOverview />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(screen.queryByText(/loading.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })

    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument()

    expect(screen.getByText(/repo 1/i)).toHaveAttribute(
      'href',
      'http://localhost/repo-1',
    )
    expect(screen.getByText(/repo 2/i)).toHaveAttribute(
      'href',
      'http://localhost/repo-2',
    )
  })
})
