import { render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import nock from 'nock'

import { UserQuery } from '@plusone/github-schema'

import { UserInfo } from './user-info'

jest.mock('../octokit-provider/octokit-provider')

describe('UserInfo', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should render successfully', async () => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          viewer: {
            avatarUrl: 'http://localhost/avatar.png',
            login: 'testuser',
          },
        },
      } as { data: UserQuery })

    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <UserInfo />
      </QueryClientProvider>,
    )

    expect(baseElement).toBeTruthy()
    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
