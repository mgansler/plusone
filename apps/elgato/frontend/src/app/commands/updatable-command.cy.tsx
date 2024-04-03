import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { UpdatableCommand } from './updatable-command'

describe('UpdatableCommand', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false, staleTime: 30_000 } },
    })

    cy.intercept('GET', '/api/devices', { fixture: 'device-list.json' }).as('deviceList')
  })

  it('should omit hue/brightness/saturation when no input is done', () => {
    cy.intercept('POST', '/api/commands', { fixture: 'command-create.json' }).as('createCommand')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <UpdatableCommand />
      </QueryClientProvider>,
    )

    cy.wait('@deviceList')

    cy.findByRole('textbox', { name: 'Command Name' }).type('New Command')
    cy.findByRole('button', { name: 'Add Action' }).click()

    cy.findByRole('combobox', { name: 'Device' }).select('ma:ca:dd:re:ss')

    cy.findByRole('button', { name: 'Submit' }).click()

    cy.wait('@createCommand')
      .its('request.body')
      .should('deep.equal', {
        name: 'New Command',
        actions: [
          {
            macAddress: 'ma:ca:dd:re:ss',
            on: true,
            powerOnly: true,
          },
        ],
      })
  })

  it('should omit hue/brightness/saturation when input was cleared', () => {
    cy.intercept('POST', '/api/commands', { fixture: 'command-create.json' }).as('createCommand')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <UpdatableCommand />
      </QueryClientProvider>,
    )

    cy.wait('@deviceList')

    cy.findByRole('textbox', { name: 'Command Name' }).type('New Command')
    cy.findByRole('button', { name: 'Add Action' }).click()

    cy.findByRole('combobox', { name: 'Device' }).select('ma:ca:dd:re:ss')
    cy.findByRole('spinbutton', { name: 'Hue' }).type('50').clear()
    cy.findByRole('spinbutton', { name: 'Saturation' }).type('50').clear()
    cy.findByRole('spinbutton', { name: 'Brightness' }).type('50').clear()

    cy.findByRole('button', { name: 'Submit' }).click()

    cy.wait('@createCommand')
      .its('request.body')
      .should('deep.equal', {
        name: 'New Command',
        actions: [
          {
            macAddress: 'ma:ca:dd:re:ss',
            on: true,
            powerOnly: true,
          },
        ],
      })
  })

  it('should include hue/brightness/saturation when input is done', () => {
    cy.intercept('POST', '/api/commands', { fixture: 'command-create.json' }).as('createCommand')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <UpdatableCommand />
      </QueryClientProvider>,
    )

    cy.wait('@deviceList')

    cy.findByRole('textbox', { name: 'Command Name' }).type('New Command')
    cy.findByRole('button', { name: 'Add Action' }).click()

    cy.findByRole('combobox', { name: 'Device' }).select('ma:ca:dd:re:ss')
    cy.findByRole('checkbox', { name: 'Power Only' }).uncheck()
    cy.findByRole('spinbutton', { name: 'Hue' }).type('30')
    cy.findByRole('spinbutton', { name: 'Saturation' }).type('50')
    cy.findByRole('spinbutton', { name: 'Brightness' }).type('70')

    cy.findByRole('button', { name: 'Submit' }).click()

    cy.wait('@createCommand')
      .its('request.body')
      .should('deep.equal', {
        name: 'New Command',
        actions: [
          {
            macAddress: 'ma:ca:dd:re:ss',
            on: true,
            powerOnly: false,
            hue: 30,
            saturation: 50,
            brightness: 70,
          },
        ],
      })
  })
})
