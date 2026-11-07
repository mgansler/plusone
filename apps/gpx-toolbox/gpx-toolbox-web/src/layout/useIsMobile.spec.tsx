import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockViewport } from './mockViewport'
import { useIsMobile } from './useIsMobile'

function Layout() {
  return <p>{useIsMobile() ? 'mobil' : 'Desktop'}</p>
}

describe('useIsMobile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reflects the current viewport', () => {
    mockViewport(true)
    render(<Layout />)

    expect(screen.getByText('mobil')).toBeTruthy()
  })

  it('re-renders when the viewport crosses the breakpoint', () => {
    const setMobile = mockViewport(false)
    render(<Layout />)
    expect(screen.getByText('Desktop')).toBeTruthy()

    act(() => setMobile(true))

    expect(screen.getByText('mobil')).toBeTruthy()
  })
})
