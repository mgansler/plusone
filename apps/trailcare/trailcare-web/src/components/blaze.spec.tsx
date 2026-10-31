import { render, screen } from '@testing-library/react'

import { SweepStatus } from '@plusone/trailcare-api-client'

import { Blaze } from './blaze'

describe('Blaze', () => {
  it.each([
    [SweepStatus.GREEN, 'frisch gefegt'],
    [SweepStatus.YELLOW, 'bald wieder fegen'],
    [SweepStatus.RED, 'fegen nötig'],
  ])('describes %s for screen readers', (status, label) => {
    render(<Blaze status={status} value={3} />)
    const blaze = screen.getByRole('img', { name: label })
    expect(blaze.dataset.status).toBe(status)
    expect(blaze.textContent).toBe('3')
  })

  it('renders without value and in large size', () => {
    render(<Blaze status={SweepStatus.GREEN} size="large" />)
    const blaze = screen.getByRole('img')
    expect(blaze.className).toContain('blaze-large')
    expect(blaze.textContent).toBe('')
  })
})
