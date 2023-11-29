import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DeviceDetails } from './device-details'

describe('DeviceDetails', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
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

    cy.wait('@deviceDetails')
    cy.wait('@groups')

    cy.findByRole('group', { name: 'Rooms' }).within(() => {
      cy.findByText('Office')
      cy.findByRole('button', { name: /Living Room/ })
    })

    cy.findByRole('group', { name: 'Groups' }).within(() => {
      cy.findByText('All')
      cy.findByRole('button').should('not.exist')
    })

    cy.intercept('PUT', '/api/devices/AA:BB:CC:DD:EE:FF/add-to-group', { statusCode: 200 }).as('addDevice')
    cy.findByRole('button', { name: /Living Room/ }).click()
    cy.wait('@addDevice')
  })
})
