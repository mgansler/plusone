import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CoordinateInput, formatCoordinate } from './CoordinateInput'

function renderInput(value: number | null, onChange = vi.fn()) {
  const utils = render(
    <CoordinateInput label="Breitengrad" value={value} onChange={onChange} onBlur={vi.fn()} placeholder="48.7" />,
  )
  return { ...utils, input: screen.getByLabelText('Breitengrad') as HTMLInputElement, onChange }
}

describe('formatCoordinate', () => {
  it('rounds to 5 decimals without trailing zeros', () => {
    expect(formatCoordinate(48.7758459)).toBe('48.77585')
    expect(formatCoordinate(9.1)).toBe('9.1')
    expect(formatCoordinate(null)).toBe('')
  })
})

describe('CoordinateInput', () => {
  it('shows an external value rounded', () => {
    const { input } = renderInput(48.123456789)

    expect(input.value).toBe('48.12346')
  })

  it('keeps partial input and reports the parsed value', () => {
    const { input, onChange } = renderInput(null)

    fireEvent.change(input, { target: { value: '48.' } })
    expect(input.value).toBe('48.')
    expect(onChange).toHaveBeenLastCalledWith(48)

    fireEvent.change(input, { target: { value: '-' } })
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('accepts a decimal comma', () => {
    const { input, onChange } = renderInput(null)

    fireEvent.change(input, { target: { value: '9,25' } })

    expect(input.value).toBe('9.25')
    expect(onChange).toHaveBeenLastCalledWith(9.25)
  })

  it('ignores letters and more than 5 decimals', () => {
    const { input, onChange } = renderInput(48.1)

    fireEvent.change(input, { target: { value: '48.1a' } })
    fireEvent.change(input, { target: { value: '48.123456' } })

    expect(input.value).toBe('48.1')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('follows external changes but does not reformat what the user typed', () => {
    const onChange = vi.fn()
    const { input, rerender } = renderInput(null, onChange)

    fireEvent.change(input, { target: { value: '48.10' } })
    rerender(<CoordinateInput label="Breitengrad" value={48.1} onChange={onChange} onBlur={vi.fn()} placeholder="" />)
    expect(input.value).toBe('48.10')

    rerender(<CoordinateInput label="Breitengrad" value={49.5} onChange={onChange} onBlur={vi.fn()} placeholder="" />)
    expect(input.value).toBe('49.5')
  })
})
