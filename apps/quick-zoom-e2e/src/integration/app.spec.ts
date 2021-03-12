describe('quick-zoom', () => {
  beforeEach(() =>
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'open')
      },
    }),
  )

  it('should be possible to add a link', () => {
    cy.findByText('Add').click()

    cy.findByRole('dialog').within(() => {
      cy.findByText('New Zoom Link')

      cy.findByLabelText('Title').type('Hello World')
      cy.findByLabelText('Zoom Link').type(
        'https://example.zoom.us/j/0123456789?pwd=some_password',
      )

      cy.findByText('Add').click()
    })

    cy.findByText('Hello World').click()

    cy.window()
      .its('open')
      .should(
        'be.calledWith',
        'zoommtg://example.zoom.us/join?action=join&confno=0123456789&pwd=some_password',
      )
  })
})
