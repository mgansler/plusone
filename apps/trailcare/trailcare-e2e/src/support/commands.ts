type Role = 'admin' | 'crew'

type TrailArea = { id: number; name: string }
type Trail = { id: number; name: string; trailAreaId: number }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- augmenting the Cypress interface
    interface Chainable {
      /** Log in via the API, the session is cached per role (or per custom password) */
      loginAs(role: Role | { password: string }): Chainable<void>
      /** Create a trail area with trails via the admin API, logs in as admin */
      createTrailArea(name: string, trails: Array<{ name: string; aliases?: Array<string> }>): Chainable<Array<Trail>>
      /** Add a care log entry via the API in the current session */
      createCareEntry(trailId: number, body: { type: string; performedAt?: string; comment?: string }): Chainable<void>
    }
  }
}

function passwordFor(role: Role | { password: string }): string {
  if (typeof role === 'object') return role.password
  return Cypress.expose(role === 'admin' ? 'adminPassword' : 'crewPassword')
}

Cypress.Commands.add('loginAs', (role) => {
  const password = passwordFor(role)
  cy.session(
    ['login', password],
    () => {
      cy.request('POST', '/api/auth/login', { password })
    },
    {
      validate: () => {
        cy.request('/api/auth/session').its('body.authenticated').should('eq', true)
      },
    },
  )
})

Cypress.Commands.add('createTrailArea', (name, trails) => {
  cy.loginAs('admin')
  return cy.request<TrailArea>('POST', '/api/admin/trail-areas', { name }).then(({ body: area }) => {
    const created: Array<Trail> = []
    trails.forEach((trail) => {
      cy.request<Trail>('POST', `/api/admin/trail-areas/${area.id}/trails`, trail).then(({ body }) => {
        created.push(body)
      })
    })
    return cy.wrap(created)
  })
})

Cypress.Commands.add('createCareEntry', (trailId, body) => {
  cy.request('POST', `/api/trails/${trailId}/care-entries`, body)
})

/** Unique names, the database is shared by all specs of a run */
export function unique(name: string): string {
  return `${name} ${Math.random().toString(36).slice(2, 7)}`
}

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}
