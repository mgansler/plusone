import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { compareList, useCompareList } from './useCompareList'

const STORAGE_KEY = 'gpx-toolbox-compare'

describe('useCompareList', () => {
  beforeEach(() => {
    compareList.clear()
  })

  it('adds routes once and persists them in localStorage', () => {
    const { result } = renderHook(() => useCompareList())

    act(() => {
      result.current.add({ id: 'a', name: 'A' })
      result.current.add({ id: 'a', name: 'A' })
      result.current.add({ id: 'b', name: 'B' })
    })

    expect(result.current.items.map((i) => i.id)).toEqual(['a', 'b'])
    expect(result.current.has('b')).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ])
  })

  it('has no limit on the number of routes', () => {
    const { result } = renderHook(() => useCompareList())

    act(() => {
      for (const id of ['a', 'b', 'c', 'd', 'e']) result.current.add({ id, name: id })
    })

    expect(result.current.items.map((i) => i.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('removes routes and moves a route to the front as reference', () => {
    const { result } = renderHook(() => useCompareList())
    act(() => {
      for (const id of ['a', 'b', 'c']) result.current.add({ id, name: id })
    })

    act(() => result.current.makeReference('c'))
    expect(result.current.items.map((i) => i.id)).toEqual(['c', 'a', 'b'])

    act(() => result.current.remove('a'))
    expect(result.current.items.map((i) => i.id)).toEqual(['c', 'b'])
  })

  it('restores the list after a reload and ignores invalid stored data', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'x', name: 'X' }, { id: 1 }, 'garbage']))
    vi.resetModules()
    const reloaded = await import('./useCompareList')

    const { result } = renderHook(() => reloaded.useCompareList())

    expect(result.current.items).toEqual([{ id: 'x', name: 'X' }])
  })
})
