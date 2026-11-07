import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockViewport } from '../layout/mockViewport'

import { TopBar } from './TopBar'

const NAV_LABELS = ['In der Nähe', 'Routen', 'Aktivitäten', 'Utils', 'Einstellungen']

describe('TopBar', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('on desktop', () => {
    it('shows the links, the user and the logout button', () => {
      mockViewport(false)
      const onLogout = vi.fn()
      render(<TopBar userName="Martin" onLogout={onLogout} />)

      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' })
      expect(
        within(nav)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(NAV_LABELS)
      expect(within(nav).getByText('Martin')).toBeTruthy()

      fireEvent.click(screen.getByRole('button', { name: 'Abmelden' }))
      expect(onLogout).toHaveBeenCalledTimes(1)
    })

    it('has no menu button', () => {
      mockViewport(false)
      render(<TopBar onLogout={vi.fn()} />)

      expect(screen.queryByRole('button', { name: 'Menü' })).toBeNull()
    })
  })

  describe('on mobile', () => {
    it('keeps the links in a menu until it is opened', () => {
      mockViewport(true)
      render(<TopBar userName="Martin" onLogout={vi.fn()} />)

      expect(screen.queryByRole('navigation')).toBeNull()
      expect(screen.queryByRole('link', { name: 'Routen' })).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: 'Menü' }))

      const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' })
      expect(
        within(nav)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(NAV_LABELS)
      expect(within(nav).getByText('Martin')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Menü', expanded: true })).toBeTruthy()
    })

    it('closes the menu when a link is chosen', () => {
      mockViewport(true)
      render(<TopBar onLogout={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'Menü' }))

      fireEvent.click(screen.getByRole('link', { name: 'Routen' }))

      expect(screen.queryByRole('navigation')).toBeNull()
    })

    it('logs out from the menu and closes it', () => {
      mockViewport(true)
      const onLogout = vi.fn()
      render(<TopBar onLogout={onLogout} />)
      fireEvent.click(screen.getByRole('button', { name: 'Menü' }))

      fireEvent.click(screen.getByRole('button', { name: 'Abmelden' }))

      expect(onLogout).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('navigation')).toBeNull()
    })
  })
})
