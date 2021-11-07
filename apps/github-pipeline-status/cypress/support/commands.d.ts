import { Options } from './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      graphql(fixture: string, options?: Options): Chainable<null>
    }
  }
}
