import { describe, expect, it } from 'vitest'

import { dateRangeParams, emptyRange, isEmptyRange, isIndoorRide, rangeParams } from './filters'

describe('isEmptyRange', () => {
  it('is empty only without both bounds', () => {
    expect(isEmptyRange(emptyRange)).toBe(true)
    expect(isEmptyRange({ min: '1', max: '' })).toBe(false)
    expect(isEmptyRange({ min: '', max: '0' })).toBe(false)
  })
})

describe('rangeParams', () => {
  it('converts the typed bounds with the factor', () => {
    expect(rangeParams({ min: '10', max: '42.5' }, 'minDistance', 'maxDistance', 1000)).toEqual({
      minDistance: 10000,
      maxDistance: 42500,
    })
  })

  it('omits empty or invalid bounds and keeps 0', () => {
    expect(rangeParams({ min: '', max: 'abc' }, 'min', 'max', 1)).toEqual({})
    expect(rangeParams({ min: '0', max: '' }, 'min', 'max', 1)).toEqual({ min: 0 })
  })
})

describe('dateRangeParams', () => {
  it('returns nothing without dates', () => {
    expect(dateRangeParams({ dateFrom: '', dateTo: '' })).toEqual({})
  })

  it('starts at local midnight of "Von" and includes the whole day of "Bis"', () => {
    const params = dateRangeParams({ dateFrom: '2024-06-01', dateTo: '2024-06-30' })

    expect(new Date(params.after)).toEqual(new Date(2024, 5, 1, 0, 0, 0))
    expect(new Date(params.before)).toEqual(new Date(2024, 6, 1, 0, 0, 0))
  })

  it('handles the end of a year', () => {
    expect(new Date(dateRangeParams({ dateFrom: '', dateTo: '2024-12-31' }).before)).toEqual(new Date(2025, 0, 1))
  })
})

describe('isIndoorRide', () => {
  it('detects trainer and virtual rides', () => {
    expect(isIndoorRide({ trainer: true, sport_type: 'Ride' })).toBe(true)
    expect(isIndoorRide({ sport_type: 'VirtualRide' })).toBe(true)
    expect(isIndoorRide({ trainer: false, sport_type: 'GravelRide' })).toBe(false)
    expect(isIndoorRide({})).toBe(false)
  })
})
