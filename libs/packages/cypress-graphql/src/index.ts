import type { Options } from './lib/cypress-graphql'

declare global {
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Chainable {
      graphql(fixture: string, options?: Options): Chainable<null>
    }
  }
}

export * from './lib/cypress-graphql'
