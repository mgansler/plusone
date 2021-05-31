Cypress.Commands.add('findDropzoneByName', (name) => {
  return cy.findByText(name).parent().parent().parent().children().last()
})

Cypress.Commands.add('drag', { prevSubject: false }, (source: string, target: string) => {
  const dataTransfer = new DataTransfer()
  cy.findByRole('button', { name: source }).trigger('dragstart', { dataTransfer })
  cy.findDropzoneByName(target).trigger('drop', { dataTransfer })
})
