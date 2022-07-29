import { mount } from 'cypress/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { MockAuthenticationProvider } from '@plusone/feeds/web/login'

import { createFeedPayload, createFeedResponse, discoverFeed } from '../../cypress/fixtures'

import { FeedsWebNewFeed } from './feeds-web-new-feed'

describe('FeedsWebNewFeed', () => {
  const timeout = 300
  const queryClient = new QueryClient()

  beforeEach(() => {
    cy.intercept('GET', `/api/feed/discover?url=${encodeURIComponent(discoverFeed.url)}`, (req) => {
      req.reply(discoverFeed)
    })

    cy.intercept('POST', '/api/feed', { body: createFeedPayload }).as('createFeed')

    mount(
      <MockAuthenticationProvider>
        <QueryClientProvider client={queryClient}>
          <FeedsWebNewFeed />
        </QueryClientProvider>
      </MockAuthenticationProvider>,
    )
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should fill inputs with response from discovery when typing', () => {
    cy.findByRole('textbox', { name: /website/i }).type(discoverFeed.url)

    cy.findByRole('textbox', { name: /title/i }).should('have.value', discoverFeed.title)
    cy.findByRole('textbox', { name: /feed url/i }).should('have.value', discoverFeed.feedUrl)

    cy.findByRole('button', { name: /add feed/i }).click()

    cy.wait('@createFeed', { timeout }).its('request.body').should('deep.equal', createFeedPayload)
  })

  it('should fill inputs with response from discovery when pasting', () => {
    cy.findByRole('textbox', { name: /website/i })
      .focus()
      .invoke('val', discoverFeed.url)
      .blur()

    cy.findByRole('textbox', { name: /title/i }).should('have.value', discoverFeed.title)
    cy.findByRole('textbox', { name: /feed url/i }).should('have.value', discoverFeed.feedUrl)

    cy.findByRole('button', { name: /add feed/i }).click()

    cy.wait('@createFeed', { timeout })
  })

  it('should be possible to overwrite the title', () => {
    cy.findByRole('textbox', { name: /website/i })
      .focus()
      .invoke('val', discoverFeed.url)
      .blur()

    cy.findByRole('textbox', { name: /title/i }).should('have.value', discoverFeed.title)
    cy.findByRole('textbox', { name: /title/i }).clear().type('My Custom Title')

    cy.intercept('POST', '/api/feed', {
      body: {
        ...createFeedResponse,
        title: 'My Custom Title',
      },
    }).as('createFeedCustomTitle')

    cy.findByRole('button', { name: /add feed/i }).click()

    cy.wait('@createFeedCustomTitle', { timeout })
      .its('request.body')
      .should('deep.equal', {
        ...createFeedPayload,
        title: 'My Custom Title',
      })
  })
})
