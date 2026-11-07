import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePlaceSearch } from './usePlaceSearch'

const geocodePlace = vi.fn()
vi.mock('../utils/geocode', () => ({ geocodePlace: (...args: Array<unknown>) => geocodePlace(...args) }))

const ulm = { id: 1, label: 'Ulm, Baden-Württemberg', lat: 48.4, lng: 9.99 }
const ulmMinnesota = { id: 2, label: 'New Ulm, Minnesota', lat: 44.3, lng: -94.46 }

async function searchFor(text: string, onPick = vi.fn()) {
  const { result } = renderHook(() => usePlaceSearch(onPick))
  act(() => result.current.setPlace(text))
  await act(() => result.current.search())
  return { result, onPick }
}

describe('usePlaceSearch', () => {
  beforeEach(() => {
    geocodePlace.mockReset()
  })

  it('picks a single match right away', async () => {
    geocodePlace.mockResolvedValue([ulm])

    const { result, onPick } = await searchFor('Ulm')

    expect(onPick).toHaveBeenCalledWith(48.4, 9.99)
    expect(result.current.place).toBe('Ulm, Baden-Württemberg')
    expect(result.current.candidates).toEqual([])
  })

  it('offers several matches instead of picking the first', async () => {
    geocodePlace.mockResolvedValue([ulm, ulmMinnesota])

    const { result, onPick } = await searchFor('Ulm')

    expect(onPick).not.toHaveBeenCalled()
    expect(result.current.candidates).toEqual([ulm, ulmMinnesota])

    act(() => result.current.pick(ulmMinnesota))

    expect(onPick).toHaveBeenCalledWith(44.3, -94.46)
    expect(result.current.candidates).toEqual([])
    expect(result.current.place).toBe('New Ulm, Minnesota')
  })

  it('reports an unknown place', async () => {
    geocodePlace.mockResolvedValue([])

    const { result, onPick } = await searchFor('Nirgendwo')

    expect(onPick).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Ort „Nirgendwo" nicht gefunden')
  })

  it('reports a failed lookup', async () => {
    geocodePlace.mockRejectedValue(new Error('offline'))

    const { result } = await searchFor('Ulm')

    expect(result.current.error).toBe('Ort konnte nicht aufgelöst werden')
    expect(result.current.loading).toBe(false)
  })

  it('ignores an empty search', async () => {
    const { result } = await searchFor('   ')

    expect(geocodePlace).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('clears the previous error and candidates on a new search', async () => {
    geocodePlace.mockResolvedValueOnce([ulm, ulmMinnesota]).mockResolvedValueOnce([])
    const { result } = await searchFor('Ulm')
    expect(result.current.candidates).toHaveLength(2)

    await act(() => result.current.search())

    expect(result.current.candidates).toEqual([])
    expect(result.current.error).not.toBeNull()
  })
})
