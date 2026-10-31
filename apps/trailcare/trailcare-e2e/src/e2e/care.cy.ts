import { daysAgo, unique } from '../support/commands'

describe('trail care', () => {
  let area: string
  let alias: string

  beforeEach(() => {
    area = unique('Heslach')
    alias = unique('Klabi')
    cy.createTrailArea(area, [
      { name: 'Klabuster', aliases: [alias] },
      { name: 'Saubuckel' },
      { name: 'Schwälblesklinge' },
    ]).then(([klabuster, saubuckel]) => {
      cy.loginAs('crew')
      cy.createCareEntry(klabuster.id, { type: 'SWEPT', performedAt: daysAgo(1) })
      cy.createCareEntry(saubuckel.id, { type: 'SWEPT', performedAt: daysAgo(3) })
    })
    cy.visit('/')
  })

  /** Trails share names across the areas of other tests, so always look inside this test's area */
  function inArea() {
    return cy.findByRole('heading', { name: area }).parent()
  }

  function trailRow(name: string) {
    return inArea().findByText(name).closest('li')
  }

  it('shows the traffic light per trail', () => {
    trailRow('Klabuster').should('have.attr', 'data-status', 'GREEN').and('contain.text', 'Gestern gefegt')
    trailRow('Saubuckel').should('have.attr', 'data-status', 'YELLOW').and('contain.text', 'Vor 3 Tagen gefegt')
    trailRow('Schwälblesklinge').should('have.attr', 'data-status', 'RED').and('contain.text', 'Noch nie gefegt')
  })

  it('sweeps a trail with one tap and undoes it', () => {
    inArea().findByRole('button', { name: 'Schwälblesklinge jetzt als gefegt eintragen' }).click()

    cy.findByText('Gefegt eingetragen: Schwälblesklinge').should('be.visible')
    trailRow('Schwälblesklinge').should('have.attr', 'data-status', 'GREEN').and('contain.text', 'Heute gefegt')

    cy.findByRole('button', { name: 'Rückgängig' }).click()
    cy.findByText('Rückgängig gemacht').should('be.visible')
    trailRow('Schwälblesklinge').should('have.attr', 'data-status', 'RED').and('contain.text', 'Noch nie gefegt')
  })

  it('hides the undo after the countdown', () => {
    inArea().findByRole('button', { name: 'Saubuckel jetzt als gefegt eintragen' }).click()
    cy.findByRole('button', { name: 'Rückgängig' }).should('be.visible')

    // The countdown runs for 10 seconds
    cy.get('.toast-undo', { timeout: 12_000 }).should('not.exist')
    trailRow('Saubuckel').should('have.attr', 'data-status', 'GREEN')
  })

  it('finds trails by alias', () => {
    cy.findByRole('searchbox', { name: 'Trail nach Name suchen' }).type(alias.toLowerCase())
    cy.findByText(`auch „${alias}“`).should('be.visible')
    cy.findAllByText('Klabuster').should('have.length', 1)
    cy.findByText('Saubuckel').should('not.exist')
  })

  it('records a fallen tree from yesterday on the trail page', () => {
    trailRow('Saubuckel').findByText('Saubuckel').click()
    cy.findByRole('heading', { name: 'Saubuckel' }).should('be.visible')

    cy.findByText('Anderes Datum oder andere Arbeit eintragen').click()
    cy.findByRole('radio', { name: 'Baum im Trail' }).check({ force: true })
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
      timeZone: 'Europe/Berlin',
    })
    cy.findByLabelText('Wann?').clear()
    cy.findByLabelText('Wann?').type(yesterday)
    cy.findByLabelText('Dein Name (optional)').type('Mia')
    cy.findByLabelText('Kommentar (optional)').type('Buche nach dem Steinfeld')
    cy.findByRole('button', { name: 'Eintragen' }).click()

    cy.findByText('Baum im Trail gemeldet: Saubuckel').should('be.visible')
    cy.findByRole('heading', { name: 'Pflegelog' })
      .next('ol')
      .children()
      .first()
      .should('contain.text', 'Baum im Trail')
      .and('contain.text', 'Buche nach dem Steinfeld')
      .and('contain.text', 'Mia')

    // A fallen tree does not count as sweeping
    cy.findByText('Vor 3 Tagen gefegt').should('be.visible')

    cy.findByRole('link', { name: 'Zurück zur Übersicht' }).click()
    trailRow('Saubuckel').should('contain.text', 'Gestern: Baum im Trail')
  })

  it('sweeps from the trail page', () => {
    trailRow('Schwälblesklinge').findByText('Schwälblesklinge').click()
    cy.findByRole('button', { name: 'Heute gefegt' }).click()

    cy.findByRole('img', { name: 'frisch gefegt' }).should('have.text', '0')
    cy.findByRole('heading', { name: 'Pflegelog' }).next('ol').children().should('have.length', 1)
  })
})
