import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList } from '../hooks/useCompareList'

import { CompareBar } from './CompareBar'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, search }: { to: string; children: ReactNode; search?: Record<string, string> }) => {
    const href = search ? `${to}?from=${search.from}` : to
    return <a href={href}>{children}</a>
  },
}))

describe('CompareBar', () => {
  beforeEach(() => {
    compareList.clear()
  })

  it('is hidden while the list is empty', () => {
    const { container } = render(<CompareBar />)

    expect(container.innerHTML).toBe('')
  })

  it('asks for a second route before comparing', () => {
    act(() => compareList.add({ id: 'a', name: 'Runde A' }))
    render(<CompareBar />)

    expect(screen.getByText('Vergleich (1)')).toBeTruthy()
    expect(screen.getByText('Mindestens eine weitere Route hinzufügen')).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('links to the comparison with two or more routes', () => {
    act(() => {
      compareList.add({ id: 'a', name: 'Runde A' })
      compareList.add({ id: 'b', name: 'Runde B' })
    })
    render(<CompareBar />)

    expect(screen.getByRole('link', { name: 'Vergleichen →' }).getAttribute('href')).toBe('/compare')
  })

  it('passes through from parameter when provided', () => {
    act(() => {
      compareList.add({ id: 'a', name: 'Runde A' })
      compareList.add({ id: 'b', name: 'Runde B' })
    })
    render(<CompareBar from="nearby" />)

    expect(screen.getByRole('link', { name: 'Vergleichen →' }).getAttribute('href')).toBe('/compare?from=nearby')
  })

  it('removes single routes and clears the list', () => {
    act(() => {
      compareList.add({ id: 'a', name: 'Runde A' })
      compareList.add({ id: 'b', name: 'Runde B' })
    })
    render(<CompareBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Runde A aus dem Vergleich entfernen' }))
    expect(screen.queryByText('Runde A')).toBeNull()
    expect(screen.getByText('Vergleich (1)')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Leeren' }))
    expect(screen.queryByLabelText('Vergleichsliste')).toBeNull()
  })
})
