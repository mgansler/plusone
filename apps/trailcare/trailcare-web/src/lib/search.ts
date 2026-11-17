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

export type FilterOptions = {
  query?: string
  careNeedsOnly?: boolean
}

/** Filter trails by name or alias, areas without matches are dropped. Matching on the area name keeps all its trails. */
export function filterTrailAreas(
  areas: Array<TrailAreaDto>,
  options: FilterOptions = {},
): { areas: Array<TrailAreaDto>; matches: Map<number, SearchMatch> } {
  const { query = '', careNeedsOnly = false } = options
  const matches = new Map<number, SearchMatch>()
  const needle = normalize(query)

  let filtered = areas

  // Filter by care needs first
  if (careNeedsOnly) {
    filtered = filtered.flatMap((area) => {
      const trails = area.trails.filter((trail) => trail.hasActiveCareNeeds)
      return trails.length > 0 ? [{ ...area, trails }] : []
    })
  }

  if (!needle) {
    return { areas: filtered, matches }
  }

  const result = filtered.flatMap((area) => {
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

  return { areas: result, matches }
}
