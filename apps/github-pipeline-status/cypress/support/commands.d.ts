declare namespace Cypress {
  interface Chainable<Subject = any> {
    graphql({ queryIncludes: string, fixture: string }): Chainable<null>
  }
}
