import { mount } from '@cypress/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { MockAuthenticationProvider } from '@plusone/feeds/web/login'

import { createFeedPayload, createFeedResponse, discoverFeed } from '../../cypress/fixtures'

import { FeedsWebNewFeed } from './feeds-web-new-feed'

describe('FeedsWebNewFeed', () => {
  beforeEach(() => {
    cy.intercept('GET', `/api/feed/discover?url=${encodeURIComponent(discoverFeed.url)}`, (req) => {
      req.reply(discoverFeed)
    })

    cy.intercept('POST', '/api/feed', (req) => {
      expect(req.body).to.deep.equals(createFeedPayload, "payload doesn't equal expectation")
      req.reply(createFeedResponse)
    }).as('createFeed')
  })

  it('should fill inputs with response from discovery when typing', () => {
    mount(
      <MockAuthenticationProvider>
        <QueryClientProvider client={new QueryClient()}>
          <FeedsWebNewFeed />
        </QueryClientProvider>
      </MockAuthenticationProvider>,
    )

    cy.findByRole('textbox', { name: /website/i }).type(discoverFeed.url)

    cy.findByRole('textbox', { name: /title/i }).should('have.value', discoverFeed.title)
    cy.findByRole('textbox', { name: /feed url/i }).should('have.value', discoverFeed.feedUrl)

    cy.findByRole('button', { name: /add feed/i }).click()

    cy.wait('@createFeed', { timeout: 150 })
  })

  it('should fill inputs with response from discovery when pasting', () => {
    mount(
      <MockAuthenticationProvider>
        <QueryClientProvider client={new QueryClient()}>
          <FeedsWebNewFeed />
        </QueryClientProvider>
      </MockAuthenticationProvider>,
    )

    cy.findByRole('textbox', { name: /website/i })
      .focus()
      .invoke('val', discoverFeed.url)
      .blur()

    cy.findByRole('textbox', { name: /title/i }).should('have.value', discoverFeed.title)
    cy.findByRole('textbox', { name: /feed url/i }).should('have.value', discoverFeed.feedUrl)

    cy.findByRole('button', { name: /add feed/i }).click()

    cy.wait('@createFeed', { timeout: 150 })
  })

  it('should be possible to overwrite the title', () => {
    mount(
      <MockAuthenticationProvider>
        <QueryClientProvider client={new QueryClient()}>
          <FeedsWebNewFeed />
        </QueryClientProvider>
      </MockAuthenticationProvider>,
    )

    cy.findByRole('textbox', { name: /website/i })
      .focus()
      .invoke('val', discoverFeed.url)
      .blur()

    cy.findByRole('textbox', { name: /title/i }).should('have.value', discoverFeed.title)
    cy.findByRole('textbox', { name: /title/i }).clear().type('My Custom Title')

    cy.intercept('POST', '/api/feed', (req) => {
      expect(req.body).to.deep.equals(
        {
          ...createFeedPayload,
          title: 'My Custom Title',
        },
        "payload doesn't equal expectation",
      )
      req.reply({ ...createFeedResponse, title: 'My Custom Title' })
    }).as('createFeedCustomTitle')

    cy.findByRole('button', { name: /add feed/i }).click()

    cy.wait('@createFeedCustomTitle', { timeout: 150 })
  })
})
