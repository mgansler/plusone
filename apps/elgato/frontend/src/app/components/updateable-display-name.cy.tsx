import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { UpdatableDisplayName } from './updateable-display-name'

describe('UpdatableDisplayName', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false, staleTime: 30_000 } },
    })
  })

  it('should allow updating the display name', () => {
    cy.intercept('GET', '/api/devices/de:vi:ce:id', { fixture: 'display-name-old.json' }).as('deviceDetailsOld')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <UpdatableDisplayName deviceId={'de:vi:ce:id'} />
      </QueryClientProvider>,
    )

    cy.wait('@deviceDetailsOld')

    cy.intercept('PUT', '/api/devices/de:vi:ce:id/display-name', { statusCode: 200 }).as('updateName')
    cy.intercept('GET', '/api/devices/de:vi:ce:id', { fixture: 'display-name-new.json' }).as('deviceDetailsNew')
    cy.findByRole('heading', { name: 'Old Name' }).should('have.css', 'cursor', 'pointer').click()
    cy.findByRole('heading').should('not.exist')
    cy.findByRole('textbox').clear().type(' New Name ')
    cy.findByRole('button').click()

    cy.wait('@updateName').its('request.body').should('deep.equal', { displayName: 'New Name' })
    cy.wait('@deviceDetailsNew')
    cy.findByRole('heading', { name: 'New Name' }).should('be.visible')
  })

  it('should force editing display name when empty', () => {
    cy.intercept('GET', '/api/devices/de:vi:ce:id', { fixture: 'display-name-empty.json' }).as('deviceDetailsEmpty')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <UpdatableDisplayName deviceId={'de:vi:ce:id'} />
      </QueryClientProvider>,
    )

    cy.wait('@deviceDetailsEmpty')

    cy.findByRole('textbox').should('be.visible')
  })
})
