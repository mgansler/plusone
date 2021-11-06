import { QueryClient, QueryClientProvider } from 'react-query'
import { mount } from '@cypress/react'

import { OctokitProvider } from '../octokit-provider/octokit-provider'

import { UserInfo } from './user-info'

describe('UserInfo', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  beforeEach(() => {
    window.localStorage.setItem('github-personal-access-token', '"fake-token"')
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should show the user name', () => {
    cy.intercept('POST', '/graphql', { fixture: 'user-info.name.json' })

    mount(
      <QueryClientProvider client={queryClient}>
        <OctokitProvider>
          <UserInfo />
        </OctokitProvider>
      </QueryClientProvider>,
    )

    cy.findByText('Test User').should('be.visible')
  })

  it('should fall back to user login', () => {
    cy.intercept('POST', '/graphql', { fixture: 'user-info.login.json' })

    mount(
      <QueryClientProvider client={queryClient}>
        <OctokitProvider>
          <UserInfo />
        </OctokitProvider>
      </QueryClientProvider>,
    )

    cy.findByText('testuser').should('be.visible')
  })
})
