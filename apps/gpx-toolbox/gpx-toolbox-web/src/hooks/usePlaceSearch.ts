import { useState } from 'react'
import i18n from 'i18next'

import { geocodePlace, type GeocodeResult } from '../utils/geocode'

/**
 * Search a place by name. A single match is picked right away, several matches are offered as `candidates`
 * so the user chooses instead of jumping to the first one.
 */
export function usePlaceSearch(onPick: (lat: number, lng: number) => void) {
  const [place, setPlace] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Array<GeocodeResult>>([])

  function pick(result: GeocodeResult) {
    setCandidates([])
    setPlace(result.label)
    onPick(result.lat, result.lng)
  }

  async function search() {
    if (!place.trim()) return
    setLoading(true)
    setError(null)
    setCandidates([])
    try {
      const results = await geocodePlace(place)
      if (results.length === 0) {
        setError(i18n.t('placeSearch.notFound', { place }))
      } else if (results.length === 1) {
        pick(results[0])
      } else {
        setCandidates(results)
      }
    } catch {
      setError(i18n.t('placeSearch.resolveError'))
    } finally {
      setLoading(false)
    }
  }

  return { place, setPlace, loading, error, candidates, search, pick }
}

export type PlaceSearch = ReturnType<typeof usePlaceSearch>
