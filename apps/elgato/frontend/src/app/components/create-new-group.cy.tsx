import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CreateNewGroup } from './create-new-group'

describe('CreateNewGroup', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
    })
  })

  it('should create a new group where user can select room', () => {
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <CreateNewGroup />
      </QueryClientProvider>,
    )

    cy.findByLabelText('Name').should('be.visible')
    cy.findByLabelText('Room').should('be.visible')
    cy.findByRole('button', { name: 'Add' }).should('be.visible')
  })

  it('should possible able to create a group', () => {
    cy.intercept('POST', '/api/groups', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'My Group',
        isRoom: false,
      },
    }).as('createGroup')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <CreateNewGroup />
      </QueryClientProvider>,
    )

    cy.findByLabelText('Name').type('My Group')
    cy.findByLabelText('Room').uncheck()
    cy.findByRole('button', { name: 'Add' }).click()

    cy.wait('@createGroup').its('request.body').should('deep.equal', { name: 'My Group', isRoom: false })
  })

  it('should possible able to create a room', () => {
    cy.intercept('POST', '/api/groups', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'My Group',
        isRoom: true,
      },
    }).as('createRoom')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <CreateNewGroup />
      </QueryClientProvider>,
    )

    cy.findByLabelText('Name').type('My Room')
    cy.findByLabelText('Room').check()
    cy.findByRole('button', { name: 'Add' }).click()

    cy.wait('@createRoom').its('request.body').should('deep.equal', { name: 'My Room', isRoom: true })
  })

  it('should enforce a group', () => {
    cy.intercept('POST', '/api/groups', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'My Group',
        isRoom: false,
      },
    }).as('createGroup')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <CreateNewGroup enforceGroupOrRoom={'group'} />
      </QueryClientProvider>,
    )

    cy.findByLabelText('Name').type('My Group')
    cy.findByLabelText('Room').should('not.exist')
    cy.findByRole('button', { name: 'Add' }).click()

    cy.wait('@createGroup').its('request.body').should('deep.equal', { name: 'My Group', isRoom: false })
  })

  it('should enforce a room', () => {
    cy.intercept('POST', '/api/groups', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'My Room',
        isRoom: false,
      },
    }).as('createRoom')

    cy.mount(
      <QueryClientProvider client={queryClient}>
        <CreateNewGroup enforceGroupOrRoom={'room'} />
      </QueryClientProvider>,
    )

    cy.findByLabelText('Name').type('My Room')
    cy.findByLabelText('Room').should('not.exist')
    cy.findByRole('button', { name: 'Add' }).click()

    cy.wait('@createRoom').its('request.body').should('deep.equal', { name: 'My Room', isRoom: true })
  })
})
