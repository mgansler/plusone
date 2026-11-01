import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with the initial value', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 400))

    expect(result.current).toBe('a')
  })

  it('updates only after the value stayed unchanged for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(300))
    rerender({ value: 'abc' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('abc')
  })
})
