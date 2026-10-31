import { CareEntry } from '@plusone/trailcare-persistence'

import { ActiveSession } from './auth/session.service'
import { CareEntryDto } from './dto/care-entry.dto'

/** How long the creator of an entry may undo it (the UI shows a shorter countdown to absorb latency) */
export const UNDO_WINDOW_MS = 15_000

export function undoableUntil(entry: CareEntry, session?: ActiveSession, now = Date.now()): Date | undefined {
  if (!session || entry.createdBySessionId !== session.id) {
    return undefined
  }
  const until = entry.createdAt.getTime() + UNDO_WINDOW_MS
  return until > now ? new Date(until) : undefined
}

export function toCareEntryDto(entry: CareEntry, session?: ActiveSession): CareEntryDto {
  return {
    id: entry.id,
    trailId: entry.trailId,
    type: entry.type,
    performedAt: entry.performedAt,
    comment: entry.comment ?? undefined,
    performedBy: entry.performedBy ?? undefined,
    createdAt: entry.createdAt,
    undoableUntil: undoableUntil(entry, session),
  }
}
