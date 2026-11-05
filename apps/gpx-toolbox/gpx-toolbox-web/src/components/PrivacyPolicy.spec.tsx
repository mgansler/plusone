import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PrivacyPolicy } from './PrivacyPolicy'

describe('PrivacyPolicy', () => {
  it('explains the login with Google', () => {
    render(<PrivacyPolicy />)

    expect(screen.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '2.1 Anmeldung mit Google' })).toBeTruthy()
  })

  it('names the third parties that receive data', () => {
    render(<PrivacyPolicy />)

    expect(screen.getByText(/Open-Meteo \(open-meteo.com\)/)).toBeTruthy()
    expect(screen.getByText(/OpenStreetMap \(OpenStreetMap Foundation\)/)).toBeTruthy()
  })

  it('tells what the logs contain and that the access log is deleted after 14 days', () => {
    render(<PrivacyPolicy />)

    expect(screen.getByRole('heading', { name: '2.4 Protokolle' })).toBeTruthy()
    expect(screen.getByText(/Zugriffsprotokoll des Reverse-Proxys/)).toBeTruthy()
    expect(screen.getByText(/nach 14 Tagen gelöscht/)).toBeTruthy()
    expect(screen.getByText(/Zugriffsprotokolle des Reverse-Proxys löschen wir nach 14 Tagen/)).toBeTruthy()
    expect(screen.getByText(/Es enthält keine IP-Adresse und keinen Namen/)).toBeTruthy()
    expect(screen.getByText(/nach Größe rotiert, es enthält höchstens die letzten ca. 30 MB/)).toBeTruthy()
  })

  it('tells that heart rate is health data and that the upload is the consent', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(screen.getByText('Herzfrequenz:')).toBeTruthy()
    expect(container.textContent).toContain('gelten deshalb als Gesundheitsdaten (Art. 9 DSGVO)')
    expect(container.textContent).toContain('Art. 9 Abs. 2 lit. a DSGVO')
    expect(container.textContent).toContain('durch das Hochladen der Datei erteilst')
  })

  it('states that a data processing agreement exists without a leftover note', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(container.textContent).toContain('Vertrags zur Auftragsverarbeitung nach Art. 28 DSGVO.')
    expect(container.textContent).not.toContain('AV-Vertrag im Kundenkontrollpanel')
  })

  it('names the hosting provider and links its privacy policy', () => {
    render(<PrivacyPolicy />)

    expect(screen.getByText(/Server der netcup GmbH, Emmy-Noether-Straße 10, 76131 Karlsruhe/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Datenschutzerklärung von netcup' }).getAttribute('href')).toBe(
      'https://www.netcup.com/de/kontakt/datenschutzerklaerung',
    )
  })

  it('links the privacy policies of Google and netcup in a new tab', () => {
    render(<PrivacyPolicy />)

    for (const [name, href] of [
      ['Datenschutzerklärung von Google', 'https://policies.google.com/privacy'],
      ['Datenschutzerklärung von netcup', 'https://www.netcup.com/de/kontakt/datenschutzerklaerung'],
    ]) {
      const link = screen.getByRole('link', { name })
      expect(link.getAttribute('href')).toBe(href)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })

  it('has no open placeholders left', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(container.querySelector('mark')).toBeNull()
  })

  it('names only the map providers the app uses and where they process data', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(container.textContent).not.toMatch(/opentopomap/i)
    expect(container.textContent).toContain('OpenStreetMap (OpenStreetMap Foundation) oder Esri ArcGIS')
    expect(container.textContent).toContain('weltweites Netz von Cache-Servern')
    expect(container.textContent).toContain('im Vereinigten Königreich')
  })

  it('names the data center, the supervisory authority and the date', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(container.textContent).toContain('Nürnberg, Deutschland')
    expect(container.textContent).toContain('Baden-Württemberg, Heilbronner Straße 35, 70191 Stuttgart')
    expect(container.textContent).toContain('Stand: 5. November 2026')
  })

  it('does not mention Strava any more', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(container.textContent).not.toMatch(/strava/i)
  })

  it('has the contact details of the operator filled in', () => {
    const { container } = render(<PrivacyPolicy />)

    expect(container.textContent).toContain('gpx-toolbox@martingansler.de')
    expect(container.textContent).not.toContain('[E-Mail-Adresse]')
    expect(container.textContent).not.toContain('[Straße und Hausnummer]')
  })

  it('links the imprint', () => {
    render(<PrivacyPolicy />)

    expect(screen.getByRole('link', { name: 'Impressum' }).getAttribute('href')).toBe('/impressum')
  })

  it('links back to the app', () => {
    render(<PrivacyPolicy />)

    expect(screen.getByRole('link', { name: '← Zurück' }).getAttribute('href')).toBe('/')
  })
})
