import { performedAtForDay, relativeDay, sweptLabel, toDayKey } from './format'

describe('format', () => {
  it('describes the last sweep', () => {
    expect(sweptLabel(undefined)).toBe('Noch nie gefegt')
    expect(sweptLabel(0)).toBe('Heute gefegt')
    expect(sweptLabel(1)).toBe('Gestern gefegt')
    expect(sweptLabel(5)).toBe('Vor 5 Tagen gefegt')
  })

  it('uses the Berlin calendar day', () => {
    expect(toDayKey(new Date('2026-11-02T23:30:00Z'))).toBe('2026-11-03')
  })

  it('sends no date for today and noon for earlier days', () => {
    expect(performedAtForDay('2026-11-03', '2026-11-03')).toBeUndefined()
    expect(new Date(performedAtForDay('2026-11-02', '2026-11-03') as string).getHours()).toBe(12)
  })

  it('formats relative days', () => {
    const now = new Date('2026-11-10T10:00:00Z')
    expect(relativeDay('2026-11-10T06:00:00Z', now)).toBe('heute')
    expect(relativeDay('2026-11-09T06:00:00Z', now)).toBe('gestern')
    expect(relativeDay('2026-11-07T06:00:00Z', now)).toBe('vor 3 Tagen')
    expect(relativeDay('2026-10-01T06:00:00Z', now)).toContain('2026')
  })
})
