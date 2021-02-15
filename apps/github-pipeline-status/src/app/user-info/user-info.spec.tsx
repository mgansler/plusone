import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { UserInfo } from './user-info'

jest.mock('../octokit-provider/octokit-provider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useLogout: () => {},
  useOctokit: () => ({
    graphql: () => ({
      viewer: {
        avatarUrl: 'http://localhost/avatar.png',
        login: 'testuser',
      },
    }),
  }),
}))

describe('UserInfo', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <UserInfo />
      </QueryClientProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
