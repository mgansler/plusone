import type { Options } from './lib/cypress-graphql'

declare global {
  namespace Cypress {
    interface Chainable {
      graphql(fixture: string, options?: Options): Chainable<null>
    }
  }
}

export * from './lib/cypress-graphql'
