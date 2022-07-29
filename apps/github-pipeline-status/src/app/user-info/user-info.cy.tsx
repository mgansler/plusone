import { mount } from 'cypress/react'
import { QueryClient, QueryClientProvider } from 'react-query'

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
    cy.graphql('user-info.name.json').as('fetch')

    mount(
      <QueryClientProvider client={queryClient}>
        <OctokitProvider>
          <UserInfo />
        </OctokitProvider>
      </QueryClientProvider>,
    )

    cy.wait('@fetch')
    cy.findByText('Test User').should('be.visible')
  })

  it('should fall back to user login', () => {
    cy.graphql('user-info.login.json').as('fetch')

    mount(
      <QueryClientProvider client={queryClient}>
        <OctokitProvider>
          <UserInfo />
        </OctokitProvider>
      </QueryClientProvider>,
    )

    cy.wait('@fetch')
    cy.findByText('testuser').should('be.visible')
  })
})
