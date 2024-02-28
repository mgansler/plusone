import Chainable = Cypress.Chainable

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/consistent-type-definitions
  interface Chainable<Subject> {
    findDropzoneByName(name: string): Chainable<Element>

    drag(text: string, target: string): void
  }
}

Cypress.Commands.add('findDropzoneByName', (name: string) => {
  return cy.findByText(name).parent().parent().parent().children().last() as unknown as Chainable<Element>
})

Cypress.Commands.add('drag', { prevSubject: false }, (source: string, target: string) => {
  const dataTransfer = new DataTransfer()
  cy.findByRole('button', { name: source }).trigger('dragstart', { dataTransfer })
  cy.findDropzoneByName(target).trigger('drop', { dataTransfer })
})
