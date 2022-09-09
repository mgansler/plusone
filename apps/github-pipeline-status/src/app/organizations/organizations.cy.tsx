import { createTheme, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mount } from 'cypress/react'
import { BrowserRouter } from 'react-router-dom'

import { OctokitProvider } from '../octokit-provider/octokit-provider'

import { Organizations } from './organizations'

function mountOrganizations() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  mount(
    <ThemeProvider theme={createTheme()}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <OctokitProvider>
            <Organizations />
          </OctokitProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>,
  )
}

describe('Organizations', () => {
  beforeEach(() => {
    window.localStorage.setItem('github-personal-access-token', '"fake-token"')
  })

  it('should render successfully with an empty result', () => {
    cy.graphql('organizations.empty.json').as('fetch')

    mountOrganizations()

    cy.wait('@fetch')
  })

  it('should render successfully with an entry', () => {
    cy.graphql('organizations.entry.json', { filter: 'Organizations' }).as('organizations')
    cy.graphql('repository-overview.json', { filter: 'RepositoryOverview' }).as('repository-overview')

    mountOrganizations()

    cy.wait('@organizations')

    cy.findByRole('button', { name: 'Select Organization' }).click()
    cy.findByText('Organization Name').click()

    cy.wait('@repository-overview')
    cy.findByText(/repo 1/i).should('be.visible')
    cy.findByText(/repo 2/i).should('be.visible')
  })
})
