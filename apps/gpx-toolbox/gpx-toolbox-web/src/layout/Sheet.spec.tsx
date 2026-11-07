import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Sheet } from './Sheet'

describe('Sheet', () => {
  it('shows its content as a named dialog while open', () => {
    render(
      <Sheet side="bottom" open onClose={vi.fn()} label="Suche">
        <p>Inhalt</p>
      </Sheet>,
    )

    expect(screen.getByRole('dialog', { name: 'Suche' })).toBeTruthy()
    expect(screen.getByText('Inhalt')).toBeTruthy()
  })

  it('hides its content from the accessibility tree while closed', () => {
    render(
      <Sheet side="right" open={false} onClose={vi.fn()} label="Routen">
        <button>Teilen</button>
      </Sheet>,
    )

    expect(screen.queryByRole('dialog', { name: 'Routen' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Teilen' })).toBeNull()
  })

  it('makes closed content inert and open content reachable', () => {
    const { rerender } = render(
      <Sheet side="right" open={false} onClose={vi.fn()} label="Routen">
        Inhalt
      </Sheet>,
    )
    const body = screen.getByText('Inhalt')
    expect(body.hasAttribute('inert')).toBe(true)

    rerender(
      <Sheet side="right" open onClose={vi.fn()} label="Routen">
        Inhalt
      </Sheet>,
    )
    expect(body.hasAttribute('inert')).toBe(false)
    expect(screen.getByRole('dialog', { name: 'Routen' })).toBeTruthy()
  })

  it('does not hide or show the panel, it only slides', () => {
    const { rerender } = render(
      <Sheet side="right" open={false} onClose={vi.fn()} label="Routen">
        Inhalt
      </Sheet>,
    )
    const body = screen.getByText('Inhalt')
    expect(body.style.visibility).toBe('')

    rerender(
      <Sheet side="right" open onClose={vi.fn()} label="Routen">
        Inhalt
      </Sheet>,
    )
    expect(body.style.visibility).toBe('')
  })

  it('keeps the handle reachable while closed', () => {
    render(
      <Sheet side="right" open={false} onClose={vi.fn()} label="Routen" handle={<button>Routen anzeigen</button>}>
        Inhalt
      </Sheet>,
    )

    expect(screen.getByRole('button', { name: 'Routen anzeigen' })).toBeTruthy()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <Sheet side="bottom" open onClose={onClose} label="Suche">
        Inhalt
      </Sheet>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores Escape while closed', () => {
    const onClose = vi.fn()
    render(
      <Sheet side="bottom" open={false} onClose={onClose} label="Suche">
        Inhalt
      </Sheet>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on a click on the backdrop, not on a click inside', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Sheet side="bottom" open onClose={onClose} label="Suche">
        <p>Inhalt</p>
      </Sheet>,
    )

    fireEvent.click(screen.getByText('Inhalt'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(container.firstElementChild as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('leaves the page usable without a backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Sheet side="top" open onClose={onClose} label="Routen" backdrop={false}>
        <p>Inhalt</p>
      </Sheet>,
    )

    // Only the panel itself, no dimming layer in front of the page
    expect(container.children).toHaveLength(1)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
