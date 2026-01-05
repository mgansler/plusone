import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Egg } from './egg'

describe('Egg', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false, staleTime: 30_000 } },
    })

    // The Router also mounts the DeviceList component, but we do not care about this for this test.
    cy.intercept('GET', '/api/devices', { body: { devices: [] } })
  })

  it('should calculate the cooking duration', () => {
    cy.stub(navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
      success({
        coords: {
          latitude: 52.52,
          longitude: 13.405,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      })
    })

    cy.intercept('GET', '/api/weather/elevation?latitude=52.52&longitude=13.405', { body: 300 }).as('elevation')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <Egg />
      </QueryClientProvider>,
    )

    cy.wait('@elevation')

    cy.findByText('Cook for 5:46 minutes.').should('be.visible')

    cy.findByRole('slider', { name: 'Size: M' }).invoke('val', 50).trigger('input')

    cy.findByLabelText('Size: L').should('be.visible')
    cy.findByText('Cook for 7:07 minutes.').should('be.visible')

    cy.findByRole('checkbox', { name: 'Refrigerator:' }).uncheck()
    cy.findByText('Cook for 6:23 minutes.').should('be.visible')

    cy.findByRole('slider', { name: 'Target inner temperature (softness): 67°C' }).invoke('val', 74).trigger('input')
    cy.findByText('Cook for 7:22 minutes.').should('be.visible')
  })
})
