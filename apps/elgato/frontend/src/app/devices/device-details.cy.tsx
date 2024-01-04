import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DeviceDetails } from './device-details'

describe('DeviceDetails', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false, staleTime: 30_000 } },
    })
    cy.intercept('GET', '/api/groups', { fixture: 'groups.json' }).as('groups')
  })

  it('should toggle the state of the device', () => {
    cy.intercept('GET', '/api/devices/AA:BB:CC:DD:EE:FF', { fixture: 'AA-BB-CC-DD-EE-FF.off.json' }).as('deviceDetails')

    cy.mount(
      <MemoryRouter initialEntries={['/devices/AA:BB:CC:DD:EE:FF']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path={'/devices/:deviceId'} element={<DeviceDetails />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    cy.wait('@deviceDetails')
    cy.wait('@groups')

    cy.intercept('PUT', '/api/devices/AA:BB:CC:DD:EE:FF/toggle', { statusCode: 200 }).as('toggle')
    cy.intercept('GET', '/api/devices/AA:BB:CC:DD:EE:FF', { fixture: 'AA-BB-CC-DD-EE-FF.on.json' }).as('deviceDetails')
    cy.findByRole('button', { name: 'Turn on' }).click()
    cy.wait('@toggle')
  })

  it('should list groups', () => {
    cy.intercept('GET', '/api/devices/AA:BB:CC:DD:EE:FF', { fixture: 'AA-BB-CC-DD-EE-FF.off.json' }).as('deviceDetails')

    cy.mount(
      <MemoryRouter initialEntries={['/devices/AA:BB:CC:DD:EE:FF']}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path={'/devices/:deviceId'} element={<DeviceDetails />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    cy.wait('@groups')
    cy.wait('@deviceDetails')
    // We start with 2 here because there's a child component that also fetches the details
    cy.get('@deviceDetails.all').should('have.length', 2)

    cy.findByRole('group', { name: 'Rooms' }).within(() => {
      cy.findByText('Office')
      cy.findByRole('button', { name: /Living Room/ })
    })

    cy.findByRole('group', { name: 'Groups' }).within(() => {
      cy.findByText('All')
    })

    cy.intercept('PUT', '/api/devices/AA:BB:CC:DD:EE:FF/add-to-group', { statusCode: 200 }).as('addDevice')
    cy.findByRole('button', { name: /Living Room/ }).click()
    cy.wait('@addDevice')
    cy.get('@deviceDetails.all').should('have.length', 3)

    cy.intercept('DELETE', '/api/devices/AA:BB:CC:DD:EE:FF/remove-from-group', { statusCode: 200 }).as('removeDevice')
    cy.findByRole('button', { name: /Remove device from Office/ }).click()
    cy.wait('@removeDevice')
    cy.get('@deviceDetails.all').should('have.length', 4)
  })
})
