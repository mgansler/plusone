import { renderHook, act } from '@testing-library/react'

import { useCollapsedAreas } from './use-collapsed-areas'

describe('useCollapsedAreas', () => {
  const storageKey = 'test-collapsed-areas'

  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty set when localStorage is empty', () => {
    const { result } = renderHook(() => useCollapsedAreas(storageKey))

    expect(result.current.isCollapsed(1)).toBe(false)
    expect(result.current.isCollapsed(2)).toBe(false)
  })

  it('loads saved collapsed areas from localStorage', () => {
    localStorage.setItem(storageKey, JSON.stringify([1, 3]))

    const { result } = renderHook(() => useCollapsedAreas(storageKey))

    expect(result.current.isCollapsed(1)).toBe(true)
    expect(result.current.isCollapsed(2)).toBe(false)
    expect(result.current.isCollapsed(3)).toBe(true)
  })

  it('saves state to localStorage on toggle', () => {
    const { result } = renderHook(() => useCollapsedAreas(storageKey))

    act(() => {
      result.current.toggle(1)
    })

    expect(result.current.isCollapsed(1)).toBe(true)
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify([1]))
  })

  it('removes area on second toggle', () => {
    localStorage.setItem(storageKey, JSON.stringify([1]))
    const { result } = renderHook(() => useCollapsedAreas(storageKey))

    act(() => {
      result.current.toggle(1)
    })

    expect(result.current.isCollapsed(1)).toBe(false)
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify([]))
  })

  it('ignores invalid data in localStorage', () => {
    localStorage.setItem(storageKey, 'invalid-json')

    const { result } = renderHook(() => useCollapsedAreas(storageKey))

    expect(result.current.isCollapsed(1)).toBe(false)
  })

  it('filters only numbers from the saved array', () => {
    localStorage.setItem(storageKey, JSON.stringify([1, '2', 3, null, 4]))

    const { result } = renderHook(() => useCollapsedAreas(storageKey))

    expect(result.current.isCollapsed(1)).toBe(true)
    expect(result.current.isCollapsed(3)).toBe(true)
    expect(result.current.isCollapsed(4)).toBe(true)
  })

  it('works when localStorage is unavailable', () => {
    const originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    try {
      const { result } = renderHook(() => useCollapsedAreas(storageKey))

      act(() => {
        result.current.toggle(1)
      })

      expect(result.current.isCollapsed(1)).toBe(true)
    } finally {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      })
    }
  })
})
