import { useEffect, useRef } from 'react'
import L from 'leaflet'

import type { NearbyRouteResponseDto } from '@plusone/gpx-toolbox-api-client'
import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { defaultCenter } from '../components/Map'
import { routeStyle } from '../utils/routeColors'

import type { SearchArea } from './useSearchArea'

type TrackStyle = Pick<L.PolylineOptions, 'weight' | 'opacity'>

/** Track style: with a highlighted route, all others fade so the highlighted one stands out */
function trackStyle(isHighlighted: boolean, hasHighlight: boolean): TrackStyle {
  if (isHighlighted) return { weight: 6, opacity: 1 }
  return hasHighlight ? { weight: 3, opacity: 0.7 } : { weight: 3, opacity: 0.8 }
}

/**
 * Draggable marker and radius circle at the search center. A click anywhere on the map moves the center there.
 * The layers are kept across renders and updated in place.
 */
export function useSearchAreaLayers(
  map: L.Map | null,
  { lat, lng, radius, setLat, setLng }: Pick<SearchArea, 'lat' | 'lng' | 'radius' | 'setLat' | 'setLng'>,
) {
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  // Latest search center for the deferred layer creation below
  const centerRef = useRef({ lat, lng, radius })
  centerRef.current = { lat, lng, radius }

  useEffect(() => {
    if (!map) return

    // The map DOM container may not be in the document yet when this effect
    // runs (onMapReady fires during the same render cycle). Defer to the
    // next macrotask so the browser has committed the layout first.
    let onMapClick: ((e: L.LeafletMouseEvent) => void) | null = null

    setTimeout(() => {
      // Read the center at creation time: it may have been set (e.g. by geolocation) meanwhile
      const initLat = centerRef.current.lat ?? defaultCenter[0]
      const initLng = centerRef.current.lng ?? defaultCenter[1]

      if (!markerRef.current) {
        const marker = L.marker([initLat, initLng], { draggable: true, title: 'Suchzentrum' }).addTo(map)
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          setLat(p.lat)
          setLng(p.lng)
        })
        markerRef.current = marker
      }

      if (!circleRef.current) {
        circleRef.current = L.circle([initLat, initLng], {
          radius: centerRef.current.radius * 1000,
          color: '#2196f3',
          weight: 2,
          fillColor: '#2196f3',
          fillOpacity: 0.08,
        }).addTo(map)
      }

      onMapClick = (e: L.LeafletMouseEvent) => {
        setLat(e.latlng.lat)
        setLng(e.latlng.lng)
      }
      map.on('click', onMapClick)
    }, 50)

    return () => {
      if (onMapClick) map.off('click', onMapClick)
    }
    // Only (re)create the layers when the map is first available.
  }, [map])

  // Keep the marker + circle in sync with the current search center / radius.
  useEffect(() => {
    if (lat == null || lng == null) return
    markerRef.current?.setLatLng([lat, lng])
    circleRef.current?.setLatLng([lat, lng]).setRadius(radius * 1000)
  }, [lat, lng, radius])
}

type ResultTrackLayersOptions = {
  results: Array<NearbyRouteResponseDto> | undefined
  /** Full-resolution track of the selected route; replaces its simplified track from `results` */
  selectedDetail: { id: string; polyline?: unknown } | undefined
  highlightedRoute: string | null
  onHover: (id: string, hovered: boolean) => void
  onToggle: (id: string) => void
}

/** Draws the tracks of all results — without moving the map. Highlighting only restyles them. */
export function useResultTrackLayers(
  map: L.Map | null,
  { results, selectedDetail, highlightedRoute, onHover, onToggle }: ResultTrackLayersOptions,
) {
  // Track layers of all results by route ID, so highlighting only restyles them
  const trackLayersRef = useRef(new Map<string, L.Polyline>())
  const highlightedRouteRef = useRef(highlightedRoute)
  highlightedRouteRef.current = highlightedRoute

  useEffect(() => {
    if (!map || !results) return

    // The generated type says string[], but the backend returns Array<{lat,lng}>
    // (from parsePolyline). Route through unknown to satisfy the cast.
    const selectedPolyline = (selectedDetail?.polyline ?? []) as Array<{ lat: number; lng: number }>

    const layer = L.layerGroup()
    const trackLayers = trackLayersRef.current
    const highlighted = highlightedRouteRef.current
    results.forEach((r, index) => {
      const points = r.id === selectedDetail?.id && selectedPolyline.length >= 2 ? selectedPolyline : r.polyline
      if (points.length < 2) return

      const track = L.polyline(
        points.map((p) => [p.lat, p.lng] as [number, number]),
        {
          ...routeStyle(index),
          ...trackStyle(r.id === highlighted, highlighted != null),
          // Keep track clicks from moving the search center (map click handler)
          bubblingMouseEvents: false,
        },
      )
        .bindTooltip(r.name, { sticky: true })
        .on('mouseover', () => onHover(r.id, true))
        .on('mouseout', () => onHover(r.id, false))
        .on('click', () => onToggle(r.id))
        .addTo(layer)
      trackLayers.set(r.id, track)
    })
    layer.addTo(map)
    if (highlighted) trackLayers.get(highlighted)?.bringToFront()

    return () => {
      layer.remove()
      trackLayers.clear()
    }
  }, [map, results, selectedDetail, onHover, onToggle])

  // Saturate the highlighted track and fade all others
  useEffect(() => {
    for (const [id, track] of trackLayersRef.current) {
      track.setStyle(trackStyle(id === highlightedRoute, highlightedRoute != null))
    }
    if (highlightedRoute) trackLayersRef.current.get(highlightedRoute)?.bringToFront()
  }, [highlightedRoute])
}

/** Marks the point under the mouse in the elevation profile on the map */
export function useProfilePointMarker(map: L.Map | null, point: TrackPoint | null) {
  useEffect(() => {
    if (!map || !point) return
    const marker = L.circleMarker([point.latitude, point.longitude], {
      radius: 6,
      color: '#1e3a8a',
      weight: 2,
      fillColor: '#60a5fa',
      fillOpacity: 1,
      interactive: false,
    }).addTo(map)
    return () => {
      marker.remove()
    }
  }, [map, point])
}
