import type { TrailAreaDto } from '@plusone/trailcare-api-client'

/** Lowercase and fold umlauts/accents, so "aeffle" and "Äffle" both match */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase('de')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export type SearchMatch = { matchedAlias?: string }

/** Filter trails by name or alias, areas without matches are dropped. Matching on the area name keeps all its trails. */
export function filterTrailAreas(
  areas: Array<TrailAreaDto>,
  query: string,
): { areas: Array<TrailAreaDto>; matches: Map<number, SearchMatch> } {
  const matches = new Map<number, SearchMatch>()
  const needle = normalize(query)
  if (!needle) {
    return { areas, matches }
  }

  const filtered = areas.flatMap((area) => {
    if (normalize(area.name).includes(needle)) {
      return [area]
    }
    const trails = area.trails.filter((trail) => {
      if (normalize(trail.name).includes(needle)) {
        return true
      }
      const alias = trail.aliases.find((candidate) => normalize(candidate).includes(needle))
      if (alias) {
        matches.set(trail.id, { matchedAlias: alias })
        return true
      }
      return false
    })
    return trails.length > 0 ? [{ ...area, trails }] : []
  })

  return { areas: filtered, matches }
}
