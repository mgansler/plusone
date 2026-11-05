import { describe, expect, it } from 'vitest'

import { emptyRange, isEmptyRange, rangeParams } from './filters'

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
