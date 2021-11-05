import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import nock from 'nock'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import { Organizations } from './organizations'

jest.mock('../octokit-provider/octokit-provider')
jest.mock('../repository-overview/repository-overview')

describe('Organizations', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  afterEach(() => {
    queryClient.clear()
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
        <MemoryRouter>
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
              nodes: [{ id: 'organization-id', login: 'organization-name', name: 'Organization Name' }],
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
        <MemoryRouter initialEntries={['/organization/organization-name']}>
          <Organizations />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })

    userEvent.click(screen.getByLabelText(/select organization/i))

    expect(screen.getByRole('option', { name: 'Organization Name' })).toBeInTheDocument()
  })
})
