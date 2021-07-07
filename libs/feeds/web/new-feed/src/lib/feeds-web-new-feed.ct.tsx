import { mount } from '@cypress/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { MockAuthenticationProvider } from '@plusone/feeds/web/login'

import { discoverFeed } from '../../cypress/fixtures'

import { FeedsWebNewFeed } from './feeds-web-new-feed'

describe('FeedsWebNewFeed', () => {
  beforeEach(() => {
    cy.intercept('GET', `/api/feed/discover?url=${encodeURIComponent(discoverFeed.url)}`, (req) => {
      req.reply(discoverFeed)
    })
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
  })
})
