import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import L from 'leaflet'

import { type TrackPoint } from '@plusone/gpx-toolbox-utils'

type SegmentOverlayProps = {
  points: Array<TrackPoint>
  mapInstance: L.Map
  /** 0-100 range, [start%, end%] of the track */
  range: [number, number]
  /** Zoom to fit the full track (only on initial load, not on range changes) */
  fitBounds?: boolean
  children?: ReactNode
}

export function SegmentOverlay({ points, mapInstance, range, fitBounds = false, children }: SegmentOverlayProps) {
  const layerRef = useRef<L.LayerGroup | null>(null)

  // ── Build and attach the overlay layer (stable ref via useCallback) ───────
  const buildLayer = useCallback(
    (container: HTMLElement, selected: Array<TrackPoint>) => {
      const layer = L.layerGroup()

      // ── Full track (greyed out) ──────────────────────────────────────────
      const fullCoords: Array<[number, number]> = points.map((p) => [p.latitude, p.longitude] as [number, number])
      L.polyline(fullCoords, {
        color: '#94a3b8',
        weight: 2,
        opacity: 0.4,
      }).addTo(layer)

      // ── Selected segment (highlighted) ───────────────────────────────────
      const selectedCoords: Array<[number, number]> = selected.map((p) => [p.latitude, p.longitude] as [number, number])
      L.polyline(selectedCoords, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.9,
      }).addTo(layer)

      // ── Start / End markers for selected segment ─────────────────────────
      const startIcon = L.divIcon({
        className: 'segment-marker start',
        html: '<div style="width:14px;height:14px;background:#22c55e;border:2px solid #fff;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(selectedCoords[0], { icon: startIcon }).addTo(layer)

      const endIcon = L.divIcon({
        className: 'segment-marker end',
        html: '<div style="width:14px;height:14px;background:#ef4444;border:2px solid #fff;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(selectedCoords[selectedCoords.length - 1], { icon: endIcon }).addTo(layer)

      // ── Fit bounds to full track only on initial load ────────────────────
      if (fitBounds && range[0] === 0 && range[1] === 100) {
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
    [points, mapInstance, fitBounds, range],
  )

  useEffect(() => {
    const selected = points.slice(
      Math.round((range[0] / 100) * (points.length - 1)),
      Math.round((range[1] / 100) * (points.length - 1)) + 1,
    )
    if (selected.length < 2) {
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
          buildLayer(c, selected)
        } else {
          requestAnimationFrame(poll)
        }
      }
      requestAnimationFrame(poll)
      return () => {
        cancelled = true
      }
    }

    const dispose = buildLayer(container, selected)
    return dispose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, range, mapInstance, buildLayer])

  return <>{children}</>
}
