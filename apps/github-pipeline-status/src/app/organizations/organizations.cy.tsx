import { createTheme, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { OctokitProvider } from '../octokit-provider/octokit-provider'

import { Organizations } from './organizations'

function mountOrganizations() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  cy.mount(
    <ThemeProvider theme={createTheme()}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <OctokitProvider>
            <Routes location={'/organization/organization-name'}>
              <Route path={'/organization/:organizationName'} element={<Organizations />} />
            </Routes>
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

    cy.findByRole('combobox', { name: 'Select Organization', timeout: 10_000 }).should('be.visible')

    cy.wait('@repository-overview')
    cy.findByText(/repo 1/i, { timeout: 10_000 }).should('be.visible')
    cy.findByText(/repo 2/i).should('be.visible')
  })
})
