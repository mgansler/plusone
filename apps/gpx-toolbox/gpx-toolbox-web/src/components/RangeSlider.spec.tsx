import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RangeSlider } from './RangeSlider'

// The RTL container is a <div>; the first descendant <div> is the component
// root, and its first child is the track wrapper holding the 4 inner divs
// (background, fill, start thumb, end thumb).
function getTrackWrapper(container: HTMLElement): HTMLElement {
  const root = container.querySelector('div') as HTMLElement
  return root.firstElementChild as HTMLElement
}

describe('RangeSlider', () => {
  it('renders a track with background, fill and two thumbs', () => {
    const { container } = render(<RangeSlider value={[0, 100]} onChange={vi.fn()} />)
    expect(getTrackWrapper(container).children.length).toBe(4)
  })

  it('positions the fill according to the value (left = value[0], right = 100 - value[1])', () => {
    const { container } = render(<RangeSlider value={[20, 80]} onChange={vi.fn()} />)
    const trackFill = getTrackWrapper(container).children[1] as HTMLElement
    expect(trackFill.style.left).toBe('20%')
    expect(trackFill.style.right).toBe('20%')
  })

  it('does not call onChange on a plain render', () => {
    const onChange = vi.fn()
    render(<RangeSlider value={[0, 100]} onChange={onChange} />)
    expect(onChange).not.toHaveBeenCalled()
  })
})
