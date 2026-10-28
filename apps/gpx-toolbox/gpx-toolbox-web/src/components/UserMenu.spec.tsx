import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { UserMenu } from './UserMenu'

vi.mock('./StravaProfile', () => ({ StravaProfile: () => <p>Profilkarte</p> }))

describe('UserMenu', () => {
  it('shows the profile only after clicking the name', () => {
    render(<UserMenu name="Martin" />)
    expect(screen.queryByText('Profilkarte')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Martin/ }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Profilkarte')).toBeTruthy()
  })

  it('closes on Escape and on a click outside', () => {
    render(
      <div>
        <UserMenu name="Martin" />
        <p>Außerhalb</p>
      </div>,
    )
    const button = screen.getByRole('button', { name: /Martin/ })

    fireEvent.click(button)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(button)
    fireEvent.pointerDown(screen.getByText('Außerhalb'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
