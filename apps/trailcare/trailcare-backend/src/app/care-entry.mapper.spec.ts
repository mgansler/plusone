import { CareEntry, CareType, Role } from '@plusone/trailcare-persistence'

import { toCareEntryDto, UNDO_WINDOW_MS, undoableUntil } from './care-entry.mapper'

const createdAt = new Date('2026-11-01T10:00:00Z')
const entry: CareEntry = {
  id: 1,
  trailId: 2,
  type: CareType.SWEPT,
  performedAt: createdAt,
  comment: null,
  performedBy: null,
  createdBySessionId: 'session-a',
  createdAt,
  updatedAt: createdAt,
}
const creator = { id: 'session-a', role: Role.USER }

describe('undoableUntil', () => {
  it('is set for the creator within the window', () => {
    expect(undoableUntil(entry, creator, createdAt.getTime() + 1_000)).toEqual(
      new Date(createdAt.getTime() + UNDO_WINDOW_MS),
    )
  })

  it('expires after the window', () => {
    expect(undoableUntil(entry, creator, createdAt.getTime() + UNDO_WINDOW_MS)).toBeUndefined()
  })

  it('is never set for other sessions, admins included', () => {
    const now = createdAt.getTime() + 1_000
    expect(undoableUntil(entry, { id: 'session-b', role: Role.ADMIN }, now)).toBeUndefined()
    expect(undoableUntil(entry, undefined, now)).toBeUndefined()
    expect(undoableUntil({ ...entry, createdBySessionId: null }, creator, now)).toBeUndefined()
  })
})

describe('toCareEntryDto', () => {
  it('maps nulls to undefined and hides the session id', () => {
    const dto = toCareEntryDto({ ...entry, comment: 'Laub', performedBy: null })
    expect(dto).toEqual({
      id: 1,
      trailId: 2,
      type: CareType.SWEPT,
      performedAt: createdAt,
      comment: 'Laub',
      performedBy: undefined,
      createdAt,
      undoableUntil: undefined,
    })
    expect(dto).not.toHaveProperty('createdBySessionId')
  })
})
