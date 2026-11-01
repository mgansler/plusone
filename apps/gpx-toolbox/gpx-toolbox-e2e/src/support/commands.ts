const TOKEN_KEY = 'gpx-toolbox-jwt'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- augmenting the Cypress interface
    interface Chainable {
      /** Log in through the OAuth flow against the Strava mock via the API, yields the JWT */
      login(): Chainable<string>
      /** Log in and open `path` with the JWT in localStorage */
      visitLoggedIn(path: string): Chainable<void>
      /** Upload a GPX fixture as route via the API, yields the route id */
      uploadRoute(fixture: string, name?: string): Chainable<string>
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

Cypress.Commands.add('login', () => {
  // /api/auth/strava → Strava (mock) → /api/auth/strava/callback → frontend with #token=
  return cy
    .request({ url: '/api/auth/strava', followRedirect: false })
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
