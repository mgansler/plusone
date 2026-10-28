import { describe, expect, it } from 'vitest'

import { formatDistance, formatDuration, formatElevation } from './format'

describe('formatDistance', () => {
  it('formats meters below 1 km', () => {
    expect(formatDistance(500)).toBe('500 m')
    expect(formatDistance(1234)).toBe('1.23 km')
  })

  it('formats meters above 1 km', () => {
    expect(formatDistance(1000)).toBe('1.00 km')
    expect(formatDistance(12345)).toBe('12.35 km')
    expect(formatDistance(123)).toBe('123 m')
  })

  it('formats zero', () => {
    expect(formatDistance(0)).toBe('0 m')
  })

  it('formats small values', () => {
    expect(formatDistance(1)).toBe('1 m')
    expect(formatDistance(999)).toBe('999 m')
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s')
    expect(formatDuration(120)).toBe('2m 0s')
    expect(formatDuration(90)).toBe('1m 30s')
  })

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3600)).toBe('1h 0m 0s')
    expect(formatDuration(7200)).toBe('2h 0m 0s')
    expect(formatDuration(3661)).toBe('1h 1m 1s')
  })

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0s')
  })
})

describe('formatElevation', () => {
  it('rounds to the nearest integer and appends meters', () => {
    expect(formatElevation(123.4)).toBe('123 m')
    expect(formatElevation(123.6)).toBe('124 m')
  })

  it('formats zero', () => {
    expect(formatElevation(0)).toBe('0 m')
  })

  it('rounds large values', () => {
    expect(formatElevation(1500.9)).toBe('1501 m')
  })
})
