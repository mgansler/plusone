import { GOOGLE_USER, type GoogleUser } from './google-mock'

const TOKEN_KEY = 'gpx-toolbox-jwt'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- augmenting the Cypress interface
    interface Chainable {
      /** Log in through the OAuth flow against the Google mock via the API (as `user`, default Max), yields the JWT */
      login(user?: GoogleUser): Chainable<string>
      /** Log in and open `path` with the JWT in localStorage */
      visitLoggedIn(path: string): Chainable<void>
      /** Upload a GPX fixture as route via the API, yields the route id */
      uploadRoute(fixture: string, name?: string): Chainable<string>
      /** Upload a GPX fixture as recorded activity via the API (matched to a similar route, or a new route) */
      uploadActivity(fixture: string, title?: string): Chainable<void>
    }
  }
}

let currentToken = ''

/** Authorization header of the user logged in last with `cy.login` */
export function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${currentToken}` }
}

function location(response: Cypress.Response<unknown>): string {
  return response.headers['location'] as string
}

Cypress.Commands.add('login', (user = GOOGLE_USER) => {
  // /api/auth/google → Google (mock) → /api/auth/google/callback → frontend with #token=
  cy.task('google:user', user)
  return cy
    .request({ url: '/api/auth/google', followRedirect: false })
    .then((response) => cy.request({ url: location(response), followRedirect: false }))
    .then((response) => cy.request({ url: location(response), followRedirect: false }))
    .then((response) => {
      const token = new URL(location(response)).hash.replace('#token=', '')
      currentToken = token
      return token
    })
})

Cypress.Commands.add('visitLoggedIn', (path) => {
  cy.login().then((token) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem(TOKEN_KEY, token)
      },
    })
  })
})

Cypress.Commands.add('uploadRoute', (fixture, name) => {
  return cy.fixture(fixture, 'utf-8').then((gpx: string) =>
    // cy.request cannot send multipart bodies, so upload with fetch
    cy.window().then(async (win) => {
      const body = new win.FormData()
      body.append('file', new win.Blob([gpx], { type: 'application/gpx+xml' }), fixture)
      body.append('source', 'manualImport')
      if (name) body.append('name', name)
      const response = await win.fetch('/api/routes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${win.localStorage.getItem(TOKEN_KEY)}` },
        body,
      })
      if (!response.ok) throw new Error(`Upload of ${fixture} failed: ${response.status}`)
      return ((await response.json()) as { id: string }).id
    }),
  )
})

Cypress.Commands.add('uploadActivity', (fixture, title) => {
  return cy.fixture(fixture, 'utf-8').then((gpx: string) =>
    // cy.request cannot send multipart bodies, so upload with fetch
    cy.window().then(async (win) => {
      const body = new win.FormData()
      body.append('file', new win.Blob([gpx], { type: 'application/gpx+xml' }), fixture)
      if (title) body.append('title', title)
      const response = await win.fetch('/api/import/activity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${win.localStorage.getItem(TOKEN_KEY)}` },
        body,
      })
      if (!response.ok) throw new Error(`Upload of activity ${fixture} failed: ${response.status}`)
    }),
  )
})
