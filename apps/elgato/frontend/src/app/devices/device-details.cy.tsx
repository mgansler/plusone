import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'

import { router } from '../../routes'

describe('DeviceDetails', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false, staleTime: 30_000 } },
    })
  })

  it('should toggle the state of the device', () => {
    cy.intercept('GET', '/api/devices/de:vi:ce:id', { fixture: 'lights.off.json' }).as('deviceDetails')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} history={createMemoryHistory({ initialEntries: ['/devices/de:vi:ce:id'] })} />
      </QueryClientProvider>,
    )

    cy.wait('@deviceDetails')

    cy.intercept('PUT', '/api/devices/de:vi:ce:id/toggle', { statusCode: 200 }).as('toggle')
    cy.intercept('GET', '/api/devices/de:vi:ce:id', { fixture: 'lights.on.json' }).as('deviceDetails')
    cy.findByRole('button', { name: 'Turn on' }).click()
    cy.wait('@toggle')
  })
})
