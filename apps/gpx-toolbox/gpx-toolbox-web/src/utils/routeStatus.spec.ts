import { describe, expect, it } from 'vitest'

import { routeStatusColor, routeStatusLabel } from './routeStatus'

describe('routeStatus', () => {
  it('labels all route statuses of the API', () => {
    expect(routeStatusLabel('planned')).toBe('Geplant')
    expect(routeStatusLabel('ridden')).toBe('Gefahren')
    expect(routeStatusLabel('foundOnline')).toBe('Online gefunden')
  })

  it('has a color for all route statuses of the API', () => {
    expect(routeStatusColor('planned')).toBe('#9c27b0')
    expect(routeStatusColor('ridden')).toBe('#4caf50')
    expect(routeStatusColor('foundOnline')).toBe('#ff5722')
  })

  it('falls back to the raw value and a neutral color for unknown statuses', () => {
    expect(routeStatusLabel('archived')).toBe('archived')
    expect(routeStatusColor('archived')).toBe('#9e9e9e')
  })
})
