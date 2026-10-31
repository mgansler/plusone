import type { CareEntryDto, SessionResponseDto, TrailAreaDto, TrailDto } from '@plusone/trailcare-api-client'
import { CareType, Role, SweepStatus } from '@plusone/trailcare-api-client'

export const USER: SessionResponseDto = { authenticated: true, role: Role.USER }
export const ADMIN: SessionResponseDto = { authenticated: true, role: Role.ADMIN }
export const LOGGED_OUT: SessionResponseDto = { authenticated: false }

export function trail(overrides: Partial<TrailDto> = {}): TrailDto {
  return {
    id: 1,
    name: 'Klabuster',
    trailAreaId: 10,
    trailAreaName: 'Heslach',
    aliases: [],
    sweepGreenMaxDays: 2,
    sweepYellowMaxDays: 4,
    sweepStatus: SweepStatus.GREEN,
    daysSinceSwept: 1,
    lastSweptAt: '2026-10-30T10:00:00.000Z',
    ...overrides,
  }
}

export function careEntry(overrides: Partial<CareEntryDto> = {}): CareEntryDto {
  return {
    id: 100,
    trailId: 1,
    type: CareType.SWEPT,
    performedAt: '2026-10-30T10:00:00.000Z',
    createdAt: '2026-10-30T10:00:00.000Z',
    ...overrides,
  }
}

export const AREAS: Array<TrailAreaDto> = [
  {
    id: 10,
    name: 'Heslach',
    trails: [
      trail(),
      trail({ id: 2, name: 'Saubuckel', sweepStatus: SweepStatus.YELLOW, daysSinceSwept: 3 }),
      trail({
        id: 3,
        name: 'Schwälblesklinge',
        sweepStatus: SweepStatus.RED,
        daysSinceSwept: undefined,
        lastSweptAt: undefined,
      }),
    ],
  },
  {
    id: 20,
    name: 'Solitude',
    trails: [
      trail({
        id: 4,
        name: 'Jojo',
        trailAreaId: 20,
        trailAreaName: 'Solitude',
        aliases: ['Yoyo'],
        sweepStatus: SweepStatus.RED,
        daysSinceSwept: 9,
        lastCareEntry: careEntry({
          id: 400,
          trailId: 4,
          type: CareType.FALLEN_TREE,
          performedAt: new Date().toISOString(),
        }),
      }),
    ],
  },
]
