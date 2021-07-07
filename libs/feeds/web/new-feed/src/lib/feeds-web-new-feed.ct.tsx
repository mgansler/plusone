import { mount } from '@cypress/react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { discoverFeed } from '../../cypress/fixtures'
import { MockAuthenticationProvider } from '../../../login/src'

import { FeedsWebNewFeed } from './feeds-web-new-feed'

describe('FeedsWebNewFeed', () => {
  it('should fill inputs with response from discovery', () => {
    cy.intercept('GET', `/api/feed/discover?url=${encodeURIComponent(discoverFeed.url)}`, (req) => {
      req.reply(discoverFeed)
    })

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
})
