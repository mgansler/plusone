declare namespace Cypress {
  interface Chainable {
    findDropzoneByName(name: string): Chainable<Element>

    drag(source: string, target: string): Chainable<Element>
  }
}
