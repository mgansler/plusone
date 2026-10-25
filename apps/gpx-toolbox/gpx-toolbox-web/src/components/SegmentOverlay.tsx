import { type ReactNode, useEffect, useRef, useState } from 'react'
import L from 'leaflet'

import { type TrackPoint } from '@plusone/gpx'

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
  const [_selectedPoints] = useState(() => {
    const startIdx = Math.round((range[0] / 100) * (points.length - 1))
    const endIdx = Math.round((range[1] / 100) * (points.length - 1))
    return { selected: points.slice(startIdx, endIdx + 1), startIdx, endIdx }
  })

  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    const startIdx = Math.round((range[0] / 100) * (points.length - 1))
    const endIdx = Math.round((range[1] / 100) * (points.length - 1))

    const selected = points.slice(startIdx, endIdx + 1)
    if (selected.length < 2) {
      return
    }

    // Guard: map may have been destroyed (e.g. parent unmount) before this effect runs
    if ((mapInstance as any).__gpxMapDestroyed) {
      console.warn('[SegmentOverlay] map destroyed, skipping layer add')
      return
    }
    const container = mapInstance._container
    if (!container || !document.contains(container) || !container._leaflet_id) {
      console.warn('[SegmentOverlay] map container not valid, skipping layer add')
      return
    }

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
      // Delay fitBounds to avoid race condition with map initialization
      requestAnimationFrame(() => {
        // Guard: map may have been destroyed (e.g. parent unmount) before RAF fires
        if ((mapInstance as any).__gpxMapDestroyed) return
        const c = mapInstance._container
        if (!c || !document.contains(c) || !c._leaflet_id) return
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
  }, [points, range, mapInstance])

  return <>{children}</>
}
