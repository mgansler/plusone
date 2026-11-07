import { useCallback, useEffect, useMemo, useState } from 'react'
import type L from 'leaflet'

import { useExportRoute, useGetRoute } from '@plusone/gpx-toolbox-api-client'
import { calculateHaversineDistance, parseGpx, type TrackPoint } from '@plusone/gpx-toolbox-utils'

import { fitRouteToMap } from '../utils/mapFit'

/** Selected and hovered route of a result list, plus the data of the selected one for its details */
export function useRouteSelection(map: L.Map | null) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  // Route under the mouse, in the result list or on the map; takes precedence over the selection
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null)
  const highlightedRoute = hoveredRoute ?? selectedRoute

  // Fetch the selected route so its full-resolution track replaces the simplified one on the map.
  // Disabled while nothing is selected (empty id would otherwise fire the query).
  const { data: detail } = useGetRoute(selectedRoute ?? '', {
    query: { enabled: selectedRoute != null },
  })

  // The route list only has 2D tracks; the elevation profile needs the GPX of the selected route.
  // The generated type says void, but the endpoint returns the GPX XML as text.
  const { data: gpx, isLoading: gpxLoading } = useExportRoute(selectedRoute ?? '', {
    query: { enabled: selectedRoute != null },
  })
  const points = useMemo(() => (typeof gpx === 'string' ? parseGpx(gpx) : []), [gpx])
  const distanceKm = useMemo(
    () => points.reduce((sum, p, i) => (i === 0 ? 0 : sum + calculateHaversineDistance(points[i - 1], p)), 0) / 1000,
    [points],
  )
  // GPX files without <ele> parse to NaN elevations, which the profile cannot draw
  const hasElevation = points.length >= 2 && points.every((p) => Number.isFinite(p.elevation))

  // Point under the mouse in the elevation profile, shown as a marker on the map
  const [profilePoint, setProfilePoint] = useState<TrackPoint | null>(null)
  useEffect(() => setProfilePoint(null), [selectedRoute])

  const setHovered = useCallback(
    (id: string, hovered: boolean) => setHoveredRoute((current) => (hovered ? id : current === id ? null : current)),
    [],
  )

  /** Select a route, or deselect it when it already is */
  const toggle = useCallback((id: string) => setSelectedRoute((current) => (current === id ? null : id)), [])

  /** Click on a route in the list: select it and zoom the map to fit it */
  function selectFromList(route: { id: string; polyline: Array<{ lat: number; lng: number }> }) {
    if (selectedRoute !== route.id && map) fitRouteToMap(map, route.polyline)
    toggle(route.id)
  }

  return {
    selectedRoute,
    hoveredRoute,
    highlightedRoute,
    setHovered,
    toggle,
    selectFromList,
    detail,
    points,
    distanceKm,
    hasElevation,
    gpxLoading,
    profilePoint,
    setProfilePoint,
  }
}

export type RouteSelection = ReturnType<typeof useRouteSelection>
