import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Imprint } from './Imprint'

describe('Imprint', () => {
  it('names the provider with a postal address', () => {
    const { container } = render(<Imprint />)

    expect(screen.getByRole('heading', { level: 1, name: 'Impressum' })).toBeTruthy()
    expect(container.textContent).toContain('Martin Gansler')
    expect(container.textContent).toContain('Ludwigstraße 42')
    expect(container.textContent).toContain('70176 Stuttgart')
  })

  it('offers the email address as a link', () => {
    render(<Imprint />)

    expect(screen.getByRole('link', { name: 'gpx-toolbox@martingansler.de' }).getAttribute('href')).toBe(
      'mailto:gpx-toolbox@martingansler.de',
    )
  })

  it('links the privacy policy and back to the app', () => {
    render(<Imprint />)

    expect(screen.getByRole('link', { name: 'Datenschutzerklärung' }).getAttribute('href')).toBe('/datenschutz')
    expect(screen.getByRole('link', { name: '← Zurück' }).getAttribute('href')).toBe('/')
  })

  it('has no placeholders left', () => {
    const { container } = render(<Imprint />)

    expect(container.querySelector('mark')).toBeNull()
    expect(container.textContent).not.toMatch(/\[.*\]/)
  })
})
