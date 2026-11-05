/** Selects a folder like the browser does: the files with their paths relative to the folder */
function selectFolder(files: Record<string, string>) {
  cy.get('input[type="file"]').then(($input) => {
    const input = $input[0] as HTMLInputElement
    const win = input.ownerDocument.defaultView as Window & typeof globalThis
    const selected = Object.entries(files).map(([path, content]) => {
      const file = new win.File([content], path.split('/').pop() ?? path)
      Object.defineProperty(file, 'webkitRelativePath', { value: path })
      return file
    })
    Object.defineProperty(input, 'files', { configurable: true, value: selected })
    input.dispatchEvent(new win.Event('change', { bubbles: true }))
  })
}

describe('Strava export import', () => {
  it('imports the routes of an export and skips the ones that are already there', () => {
    cy.fixture('hausrunde.gpx', 'utf-8').then((hausrunde: string) =>
      cy.fixture('bergtour.gpx', 'utf-8').then((bergtour: string) => {
        // The same route twice under different names, like in a real export
        const exportFolder = {
          'export_1/routes.csv':
            'Route Name,Route Filename\nHausrunde,routes/1.gpx\n"Berg, Tour",routes/2.gpx\nHausrunde (Kopie),routes/3.gpx\n',
          'export_1/routes/1.gpx': hausrunde,
          'export_1/routes/2.gpx': bergtour,
          'export_1/routes/3.gpx': hausrunde,
          'export_1/activities.csv': 'Activity ID\n1\n',
        }

        cy.visitLoggedIn('/')
        cy.findByRole('button', { name: /Strava-Export/ }).click()
        selectFolder(exportFolder)
        cy.findByRole('status').should('have.text', '3 Routen gefunden.')
        cy.findByRole('button', { name: 'Importieren' }).click()

        cy.findByText('Der Import ist fertig.').should('be.visible')
        cy.findByText('2 Routen importiert').should('be.visible')
        cy.findByText('1 übersprungen, weil sie schon vorhanden sind').should('be.visible')
        cy.findByRole('button', { name: 'Schließen' }).click()

        cy.findByRole('heading', { name: 'Routen (2)' }).should('be.visible')
        cy.findByText('Berg, Tour').should('be.visible')
        cy.findByText('Hausrunde').should('be.visible')

        // The import can be repeated without creating copies
        cy.findByRole('button', { name: /Strava-Export/ }).click()
        selectFolder(exportFolder)
        cy.findByRole('button', { name: 'Importieren' }).click()
        cy.findByText('0 Routen importiert').should('be.visible')
        cy.findByText('3 übersprungen, weil sie schon vorhanden sind').should('be.visible')
        cy.findByRole('button', { name: 'Schließen' }).click()
        cy.findByRole('heading', { name: 'Routen (2)' }).should('be.visible')
      }),
    )
  })

  it('tells when the selected folder is no Strava export', () => {
    cy.visitLoggedIn('/')
    cy.findByRole('button', { name: /Strava-Export/ }).click()

    selectFolder({ 'Downloads/foto.jpg': '' })

    cy.findByRole('alert').should('contain.text', 'keine routes.csv')
    cy.findByRole('button', { name: 'Importieren' }).should('be.disabled')
  })
})
