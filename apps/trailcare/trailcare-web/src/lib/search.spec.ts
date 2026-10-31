import type { TrailAreaDto, TrailDto } from '@plusone/trailcare-api-client'
import { SweepStatus } from '@plusone/trailcare-api-client'

import { filterTrailAreas, normalize } from './search'

function trail(id: number, name: string, aliases: Array<string> = []): TrailDto {
  return {
    id,
    name,
    aliases,
    trailAreaId: 1,
    trailAreaName: 'Area',
    sweepGreenMaxDays: 2,
    sweepYellowMaxDays: 4,
    sweepStatus: SweepStatus.RED,
  }
}

const areas: Array<TrailAreaDto> = [
  { id: 1, name: 'Solitude', trails: [trail(1, 'Äffle und Pferdle'), trail(2, 'Jojo', ['Yoyo'])] },
  { id: 2, name: 'Heslach', trails: [trail(3, 'Klabuster', ['Klabi']), trail(4, 'Saubuckel')] },
]

describe('search', () => {
  it('folds umlauts and punctuation', () => {
    expect(normalize('Äffle & Pferdle')).toBe('aeffle pferdle')
  })

  it('returns everything for an empty query', () => {
    expect(filterTrailAreas(areas, '  ').areas).toBe(areas)
  })

  it('matches names without umlauts', () => {
    const { areas: result } = filterTrailAreas(areas, 'aeffle')
    expect(result).toHaveLength(1)
    expect(result[0].trails.map((t) => t.name)).toEqual(['Äffle und Pferdle'])
  })

  it('matches aliases and reports them', () => {
    const { areas: result, matches } = filterTrailAreas(areas, 'yoyo')
    expect(result[0].trails.map((t) => t.id)).toEqual([2])
    expect(matches.get(2)).toEqual({ matchedAlias: 'Yoyo' })
  })

  it('keeps all trails when the area matches', () => {
    expect(filterTrailAreas(areas, 'heslach').areas[0].trails).toHaveLength(2)
  })
})
