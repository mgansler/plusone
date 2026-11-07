import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'

import { calculateHaversineDistance, type TrackPoint } from '@plusone/gpx-toolbox-utils'

import { mapEndMarker, mapFullTrack, mapSelectedSegment, mapStartMarker } from '../utils/routeColors'

type SegmentOverlayProps = {
  points: Array<TrackPoint>
  mapInstance: L.Map
  /** Selected segment in km, [startKm, endKm] */
  range: [number, number]
  /** Total track distance in km (used to detect full-track selection) */
  totalDistKm: number
  /** Zoom to fit the full track (only on initial load, not on range changes) */
  fitBounds?: boolean
  children?: ReactNode
}

function findClosestIndex(points: Array<TrackPoint>, targetDistKm: number): number {
  let dist = 0
  for (let i = 1; i < points.length; i++) {
    if (dist / 1000 >= targetDistKm) return i - 1
    dist += calculateHaversineDistance(points[i - 1], points[i])
  }
  return points.length - 1
}

export function SegmentOverlay({
  points,
  mapInstance,
  range,
  totalDistKm,
  fitBounds = false,
  children,
}: SegmentOverlayProps) {
  const layerRef = useRef<L.LayerGroup | null>(null)

  // Compute segment indices from km range
  const { startIdx, endIdx, isFull } = useMemo(() => {
    const s = findClosestIndex(points, range[0])
    const e = findClosestIndex(points, range[1])
    const isFull = range[0] === 0 && range[1] >= totalDistKm
    return { startIdx: s, endIdx: e, isFull: isFull }
  }, [points, range, totalDistKm])

  const selectedPoints = useMemo(() => {
    return points.slice(startIdx, endIdx + 1)
  }, [points, startIdx, endIdx])

  // ── Build and attach the overlay layer (stable ref via useCallback) ───────
  const buildLayer = useCallback(
    (container: HTMLElement, selected: Array<TrackPoint>) => {
      const layer = L.layerGroup()

      // ── Full track (greyed out) ──────────────────────────────────────────
      const fullCoords: Array<[number, number]> = points.map((p) => [p.latitude, p.longitude] as [number, number])
      L.polyline(fullCoords, {
        color: mapFullTrack,
        weight: 2,
        opacity: 0.4,
        interactive: false,
      }).addTo(layer)

      // ── Selected segment (highlighted) ───────────────────────────────────
      const selectedCoords: Array<[number, number]> = selected.map((p) => [p.latitude, p.longitude] as [number, number])
      L.polyline(selectedCoords, {
        color: mapSelectedSegment,
        weight: 4,
        opacity: 0.9,
        interactive: false,
      }).addTo(layer)

      // ── Start / End markers for selected segment ─────────────────────────
      const startIcon = L.divIcon({
        className: 'segment-marker start',
        html: `<div style="width:14px;height:14px;background:${mapStartMarker};border:2px solid #fff;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(selectedCoords[0], { icon: startIcon }).addTo(layer)

      const endIcon = L.divIcon({
        className: 'segment-marker end',
        html: `<div style="width:14px;height:14px;background:${mapEndMarker};border:2px solid #fff;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(selectedCoords[selectedCoords.length - 1], { icon: endIcon }).addTo(layer)

      // ── Fit bounds to full track only on initial load ────────────────────
      if (fitBounds && isFull) {
        requestAnimationFrame(() => {
          const c = mapInstance.getContainer()
          if (!c || !document.contains(c)) return
          const bounds = L.latLngBounds(fullCoords)
          mapInstance.fitBounds(bounds, { padding: [50, 50] })
        })
      }

      layer.addTo(mapInstance)
      layerRef.current = layer

      return () => {
        layer.remove()
        layerRef.current = null
      }
    },
    [points, mapInstance, fitBounds, isFull],
  )

  useEffect(() => {
    if (selectedPoints.length < 2) {
      return
    }

    // Defensive: wait for Leaflet's internal container to be ready.
    // The Map component's useEffect may not have run yet.
    const container = mapInstance?.getContainer()
    if (!container) {
      let cancelled = false
      const poll = () => {
        if (cancelled) return
        const c = mapInstance?.getContainer()
        if (c) {
          buildLayer(c, selectedPoints)
        } else {
          requestAnimationFrame(poll)
        }
      }
      requestAnimationFrame(poll)
      return () => {
        cancelled = true
      }
    }

    return buildLayer(container, selectedPoints)
  }, [points, selectedPoints, range, mapInstance, buildLayer])

  return <>{children}</>
}
