import { QueryClient, QueryClientProvider } from 'react-query'
import { mount } from '@cypress/react'
import { BrowserRouter } from 'react-router-dom'

import { OctokitProvider } from '../octokit-provider/octokit-provider'

import { Organizations } from './organizations'

describe('Organizations', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  beforeEach(() => {
    window.localStorage.setItem('github-personal-access-token', '"fake-token"')
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should render successfully with an empty result', () => {
    cy.intercept('POST', 'https://api.github.com/graphql', {
      fixture: 'organizations.empty.json',
    }).as('fetch')

    mount(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <OctokitProvider>
            <Organizations />
          </OctokitProvider>
        </QueryClientProvider>
      </BrowserRouter>,
    )

    cy.wait('@fetch')
  })

  it.only('should render successfully with an entry', () => {
    cy.intercept('POST', 'https://api.github.com/graphql', (req) => {
      if (req.body.hasOwnProperty('query') && req.body.query.includes('Organizations')) {
        req.alias = 'organizations'
        req.reply({ fixture: 'organizations.entry.json' })
      }

      if (req.body.hasOwnProperty('query') && req.body.query.includes('RepositoryOverview')) {
        req.alias = 'repository-overview'
        req.reply({ fixture: 'repository-overview.json' })
      }
    })

    mount(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <OctokitProvider>
            <Organizations />
          </OctokitProvider>
        </QueryClientProvider>
      </BrowserRouter>,
    )

    cy.wait('@organizations')

    cy.findByRole('button', { name: 'Select Organization' }).click()
    cy.findByText('Organization Name').click()

    cy.wait('@repository-overview')
    cy.findByText(/repo 1/i).should('be.visible')
    cy.findByText(/repo 2/i).should('be.visible')
  })
})
