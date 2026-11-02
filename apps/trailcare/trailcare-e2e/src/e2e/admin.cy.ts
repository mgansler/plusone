import { daysAgo, unique } from '../support/commands'

describe('admin area', () => {
  beforeEach(() => {
    cy.loginAs('admin')
  })

  function areaSection(name: string) {
    return cy.findByRole('heading', { name }).closest('section')
  }

  it('creates, renames and deletes trail areas and trails', () => {
    const area = unique('Birkenkopf')
    const renamed = unique('Birkenkopf Süd')
    cy.visit('/admin')

    cy.findByLabelText('Neues Trailgebiet').type(area)
    cy.findByRole('button', { name: 'Anlegen' }).click()
    areaSection(area).within(() => {
      cy.findByLabelText('Trail hinzufügen').type('Mogli')
      cy.findByRole('button', { name: 'Hinzufügen' }).click()
      cy.findByRole('link', { name: /Mogli/ }).should('be.visible')
      cy.findByRole('button', { name: 'Umbenennen' }).click()
    })
    // The heading is replaced by the form, so the section can no longer be found by it
    cy.findByLabelText('Name des Trailgebiets').clear()
    cy.findByLabelText('Name des Trailgebiets').type(renamed)
    cy.findByRole('button', { name: 'Speichern' }).click()
    cy.findByRole('heading', { name: renamed }).should('be.visible')

    cy.on('window:confirm', (text) => {
      expect(text).to.eq(`„${renamed}“ mit einem Trail und dem ganzen Pflegelog löschen?`)
      return true
    })
    areaSection(renamed).findByRole('button', { name: 'Löschen' }).click()
    cy.findByRole('heading', { name: renamed }).should('not.exist')
  })

  it('rejects duplicate area names', () => {
    const area = unique('Doppelt')
    cy.createTrailArea(area, [])
    cy.visit('/admin')

    cy.findByLabelText('Neues Trailgebiet').type(area)
    cy.findByRole('button', { name: 'Anlegen' }).click()
    cy.findByText('Ein Trailgebiet mit diesem Namen existiert bereits').should('be.visible')
  })

  it('edits aliases and own thresholds of a trail', () => {
    const area = unique('Solitude')
    cy.createTrailArea(area, [{ name: 'Jojo' }]).then(([jojo]) => {
      cy.createCareEntry(jojo.id, { type: 'SWEPT', performedAt: daysAgo(3) })
      cy.visit('/admin')
      areaSection(area).findByRole('link', { name: /Jojo/ }).click()

      cy.location('pathname').should('eq', `/admin/trails/${jojo.id}`)
      cy.findByLabelText('Weitere Namen, einer pro Zeile').type('Yoyo{enter}JJ')
      cy.findByLabelText('Eigene Werte für diesen Trail').check()
      cy.findByLabelText('Grün bis Tag').clear()
      cy.findByLabelText('Grün bis Tag').type('3')
      cy.findByLabelText('Gelb bis Tag').clear()
      cy.findByLabelText('Gelb bis Tag').type('5')
      cy.findByRole('button', { name: 'Speichern' }).click()
      cy.findByRole('button', { name: 'Gespeichert' }).should('be.visible')

      cy.findByRole('link', { name: 'Zum Pflegelog' }).click()
      cy.findByText('auch JJ, Yoyo').should('be.visible')
      cy.findByText('Grün bis 3 Tage, gelb bis 5 Tage nach dem Fegen').should('be.visible')
      // Three days ago is now within green
      cy.findByRole('img', { name: 'frisch gefegt' }).should('have.text', '3')
    })
  })

  it('edits and deletes care log entries', () => {
    const area = unique('Kräherwald')
    cy.createTrailArea(area, [{ name: 'Wurzelpfad' }]).then(([trail]) => {
      cy.createCareEntry(trail.id, { type: 'FALLEN_TREE', comment: 'Baum quer' })
      cy.visit(`/trails/${trail.id}`)

      cy.findByRole('button', { name: 'Bearbeiten' }).click()
      cy.findByLabelText('Art').select('Freigeschnitten')
      cy.findByLabelText('Kommentar').clear()
      cy.findByLabelText('Kommentar').type('Nur ein Ast')
      cy.findByRole('button', { name: 'Speichern' }).click()
      cy.findByText('Nur ein Ast').closest('li').should('contain.text', 'Freigeschnitten')

      cy.on('window:confirm', () => true)
      cy.findByRole('button', { name: 'Bearbeiten' }).click()
      cy.findByRole('button', { name: 'Löschen' }).click()
      cy.findByText('Noch keine Einträge. Trag ein, was du am Trail gemacht hast.').should('be.visible')
    })
  })

  it('creates an access password, rotates it and logs its devices out', () => {
    const label = unique('Crew Süd')
    cy.visit('/admin')

    cy.findByLabelText('Wofür ist das Passwort?').type(label)
    cy.findByRole('button', { name: 'Passwort anlegen' }).click()

    cy.findByRole('status')
      .find('code')
      .invoke('text')
      .then((password) => {
        expect(password).to.match(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/)
        cy.findByRole('button', { name: 'Fertig' }).click()

        // A crew member logs in with the new password
        cy.loginAs({ password })
        cy.visit('/')
        cy.findByRole('button', { name: 'Abmelden' }).should('be.visible')

        // The admin changes it
        cy.loginAs('admin')
        cy.visit('/admin')
        cy.contains('li', label).should('contain.text', '1 Gerät angemeldet')
        cy.window().then((win) => cy.stub(win, 'prompt').returns('neues-crew-passwort'))
        cy.contains('li', label).findByRole('button', { name: 'Passwort ändern' }).click()
        cy.findByRole('status').should('contain.text', 'neues-crew-passwort')
        cy.contains('li', label).should('contain.text', '0 Geräte angemeldet')

        cy.request({ method: 'POST', url: '/api/auth/login', body: { password }, failOnStatusCode: false })
          .its('status')
          .should('eq', 401)
      })
  })
})
