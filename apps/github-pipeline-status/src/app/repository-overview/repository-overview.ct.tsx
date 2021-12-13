import { mount } from '@cypress/react'
import { createTheme, ThemeProvider } from '@mui/material'
import { createRef } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'

import { OctokitProvider } from '../octokit-provider/octokit-provider'

import { RepositoryOverview } from './repository-overview'

describe('RepositoryOverview', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  beforeEach(() => {
    window.localStorage.setItem('github-personal-access-token', '"fake-token"')
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should fetch data and render successfully', () => {
    cy.graphql('repository-overview.json').as('fetch')

    const toolbarRef = createRef<HTMLDivElement>()

    mount(
      <ThemeProvider theme={createTheme()}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <OctokitProvider>
              <div ref={toolbarRef} />
              <RepositoryOverview toolbarRef={toolbarRef} />
            </OctokitProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>,
    )

    cy.wait('@fetch')
    cy.findByText(/repo 1/i).should('be.visible')
    cy.findByText(/repo 2/i).should('be.visible')

    // Toolbar Items
    cy.findByRole('textbox', { name: 'Repository Name' }).should('be.visible')
    cy.findByLabelText('Filter details by user').should('be.visible')
  })
})
