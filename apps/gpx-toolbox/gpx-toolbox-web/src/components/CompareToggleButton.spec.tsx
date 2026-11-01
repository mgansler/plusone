import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList } from '../hooks/useCompareList'

import { CompareToggleButton } from './CompareToggleButton'

describe('CompareToggleButton', () => {
  beforeEach(() => {
    compareList.clear()
  })

  it('adds and removes the route', () => {
    render(<CompareToggleButton id="r1" name="Hausrunde" />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(button)
    expect(button.textContent).toBe('✓ Im Vergleich')
    expect(button.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(button)
    expect(button.textContent).toBe('+ Vergleich')
  })

  it('does not trigger the surrounding card or link', () => {
    const onCardClick = vi.fn()
    render(
      <div onClick={onCardClick}>
        <CompareToggleButton id="r1" name="Hausrunde" />
      </div>,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(onCardClick).not.toHaveBeenCalled()
  })
})
