import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SidebarDivider, SidebarLayout } from './SidebarLayout'

describe('SidebarLayout', () => {
  it('renders the header and the content', () => {
    render(
      <SidebarLayout header={<h2>Titel</h2>}>
        <p>Inhalt</p>
      </SidebarLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Titel' })).toBeTruthy()
    expect(screen.getByText('Inhalt')).toBeTruthy()
  })

  it('uses the dark sidebar theme', () => {
    const { container } = render(<SidebarLayout header="Titel" />)
    const sidebar = container.firstElementChild as HTMLElement
    expect(sidebar.style.background).toBe('#1e293b')
    expect(sidebar.style.width).toBe('400px')
  })
})

describe('SidebarDivider', () => {
  it('renders a 1px line', () => {
    const { container } = render(<SidebarDivider />)
    expect((container.firstElementChild as HTMLElement).style.height).toBe('1px')
  })
})
