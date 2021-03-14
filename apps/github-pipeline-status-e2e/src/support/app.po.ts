export const login = () => {
  cy.findByLabelText(/personal access token/i).type('super_secret')
  cy.findByText(/save/i).click()
}
