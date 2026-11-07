import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'

import { defaultCenter } from '../components/Map'
import { fitSearchArea } from '../utils/mapFit'

const DEFAULT_RADIUS_KM = 2

/** Request the browser location; `onDone` also runs on failure so callers can fall back */
function locate(onFound: (lat: number, lng: number) => void, onDone?: () => void) {
  if (!navigator.geolocation) {
    onDone?.()
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onFound(pos.coords.latitude, pos.coords.longitude)
      onDone?.()
    },
    () => onDone?.(),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  )
}

/**
 * Center and radius of the route search. Starts at the browser location (fallback: default center) once
 * the map is ready, so nearby routes show up without asking for the position first.
 */
export function useSearchArea(map: L.Map | null) {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS_KM)
  const [usingGps, setUsingGps] = useState(false)

  // Handlers run later than the render that created them (geocoding, geolocation): read the latest values then
  const latest = useRef({ map, radius })
  latest.current = { map, radius }

  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null)
  useEffect(() => {
    let found = false
    locate(
      (foundLat, foundLng) => {
        found = true
        setInitialCenter([foundLat, foundLng])
      },
      () => {
        if (!found) setInitialCenter(defaultCenter)
      },
    )
  }, [])

  // Apply the initial center once both it and the map are available
  // (unless the user already picked a location in the meantime).
  const initialCenterApplied = useRef(false)
  useEffect(() => {
    if (!initialCenter || !map || initialCenterApplied.current) return
    initialCenterApplied.current = true
    if (lat != null && lng != null) return
    setLat(initialCenter[0])
    setLng(initialCenter[1])
    fitSearchArea(map, initialCenter[0], initialCenter[1], radius)
    // Force Leaflet to recalculate tile positions after the mobile layout is applied
    map.invalidateSize()
  }, [initialCenter, map, lat, lng, radius])

  // Recenter the map only when the user explicitly picks a location
  // (GPS / place / typed coordinates), not when they click or drag on the map,
  // where the view is already where they want it.
  function centerOn(nextLat: number, nextLng: number) {
    const { map, radius } = latest.current
    if (map) fitSearchArea(map, nextLat, nextLng, radius)
  }

  /** Move the search center to a location the user picked and show it on the map */
  function pickLocation(nextLat: number, nextLng: number) {
    setLat(nextLat)
    setLng(nextLng)
    centerOn(nextLat, nextLng)
  }

  /** Show the current center on the map, e.g. after the coordinates were typed in */
  function centerOnCurrent() {
    if (lat != null && lng != null) centerOn(lat, lng)
  }

  function locateMe() {
    setUsingGps(true)
    locate(pickLocation, () => setUsingGps(false))
  }

  return {
    lat,
    lng,
    radius,
    setLat,
    setLng,
    setRadius,
    usingGps,
    locateMe,
    pickLocation,
    centerOnCurrent,
  }
}

export type SearchArea = ReturnType<typeof useSearchArea>
