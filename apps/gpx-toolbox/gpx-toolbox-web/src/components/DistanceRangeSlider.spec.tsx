import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { calculateHaversineDistance, type TrackPoint } from '@plusone/gpx-toolbox-utils'

import { DistanceRangeSlider } from './DistanceRangeSlider'

/** Points along the equator, `stepDeg` apart */
function track(count: number, stepDeg = 0.009): Array<TrackPoint> {
  return Array.from({ length: count }, (_, i) => ({
    latitude: 0,
    longitude: i * stepDeg,
    elevation: 0,
    time: new Date(i * 1000),
  }))
}

const points = track(11)
const totalKm = points.slice(1).reduce((sum, p, i) => sum + calculateHaversineDistance(points[i], p), 0) / 1000

// Component root > track wrapper > background, fill, start thumb, end thumb
function parts(container: HTMLElement) {
  const wrapper = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement
  const [, fill, start, end] = Array.from(wrapper.children) as Array<HTMLElement>
  return { wrapper, fill, start, end }
}

describe('DistanceRangeSlider', () => {
  beforeAll(() => {
    // A 1000px wide track at x = 0
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 1000,
    } as DOMRect)
    HTMLElement.prototype.setPointerCapture = vi.fn()
  })

  it('positions fill and thumbs relative to the track length and shows the distances', () => {
    const { container } = render(
      <DistanceRangeSlider points={points} value={[totalKm * 0.25, totalKm * 0.75]} onChange={vi.fn()} />,
    )
    const { fill, start, end } = parts(container)

    expect(parseFloat(fill.style.left)).toBeCloseTo(25)
    expect(parseFloat(fill.style.right)).toBeCloseTo(25)
    expect(parseFloat(start.style.left)).toBeCloseTo(25)
    expect(parseFloat(end.style.left)).toBeCloseTo(75)
    expect(screen.getAllByText(/ km$/).map((label) => label.textContent)).toEqual(
      [0.25, 0.5, 0.75].map((share) => `${(totalKm * share).toFixed(2)} km`),
    )
  })

  it('moves the closer thumb to a click on the track, rounded to 10 m', () => {
    const onChange = vi.fn()
    const { container } = render(<DistanceRangeSlider points={points} value={[0, totalKm]} onChange={onChange} />)

    fireEvent.pointerDown(parts(container).wrapper, { clientX: 200, pointerId: 1 })
    expect(onChange).toHaveBeenLastCalledWith([Math.round(totalKm * 0.2 * 100) / 100, totalKm])

    fireEvent.pointerDown(parts(container).wrapper, { clientX: 900, pointerId: 1 })
    expect(onChange).toHaveBeenLastCalledWith([0, Math.round(totalKm * 0.9 * 100) / 100])
  })

  it('keeps 50 m between the thumbs while dragging', () => {
    const onChange = vi.fn()
    const { container } = render(<DistanceRangeSlider points={points} value={[0.5, 1]} onChange={onChange} />)
    const { wrapper, end } = parts(container)

    fireEvent.pointerDown(end, { pointerId: 1 })
    fireEvent.pointerMove(wrapper, { clientX: 0, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith([0.5, 0.55])
  })

  it('clamps dragging to the track and stops on pointer up', () => {
    const onChange = vi.fn()
    const { container } = render(<DistanceRangeSlider points={points} value={[0.5, 1]} onChange={onChange} />)
    const { wrapper, end } = parts(container)

    fireEvent.pointerDown(end, { pointerId: 1 })
    fireEvent.pointerMove(wrapper, { clientX: 5000, pointerId: 1 })
    expect(onChange).toHaveBeenLastCalledWith([0.5, totalKm])

    onChange.mockClear()
    fireEvent.pointerUp(wrapper, { pointerId: 1 })
    fireEvent.pointerMove(wrapper, { clientX: 100, pointerId: 1 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not produce NaN positions for a track without distance', () => {
    const { container } = render(<DistanceRangeSlider points={track(3, 0)} value={[0, 0]} onChange={vi.fn()} />)
    const { fill, start, end } = parts(container)

    expect([fill.style.left, fill.style.right, start.style.left, end.style.left]).toEqual(['0%', '100%', '0%', '0%'])
  })
})
