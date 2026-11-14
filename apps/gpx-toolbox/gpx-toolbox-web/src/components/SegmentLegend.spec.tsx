import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SegmentLegend } from './SegmentLegend'

describe('SegmentLegend', () => {
  it('renders the three segment type labels', () => {
    render(<SegmentLegend />)
    expect(screen.getByText('Anstieg')).toBeTruthy()
    expect(screen.getByText('Abstieg')).toBeTruthy()
    expect(screen.getByText('Flach')).toBeTruthy()
  })

  it('renders three color swatches', () => {
    const { container } = render(<SegmentLegend />)
    // Each row has a swatch span with a background color
    const swatches = container.querySelectorAll('span[style*="background-color"]')
    expect(swatches.length).toBe(3)
  })

  it('uses the correct colors for each segment type', () => {
    const { container } = render(<SegmentLegend />)

    // Check that the style attribute contains the hex colors
    const html = container.innerHTML
    expect(html).toContain('#22c55e')
    expect(html).toContain('#f97316')
    expect(html).toContain('#60a5fa')
  })

  it('legend container is positioned absolutely', () => {
    const { container } = render(<SegmentLegend />)
    const legendContainer = container.firstChild as HTMLElement
    expect(legendContainer.style.position).toBe('absolute')
  })
})
