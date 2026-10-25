import { useEffect, useRef } from 'react'
import L from 'leaflet'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'
import { calculateHaversineDistance } from '@plusone/gpx-toolbox-utils'

type TrackOverlayProps = {
  points: Array<TrackPoint>
  mapInstance: L.Map
  onPointClick?: (point: TrackPoint, event: L.LeafletMouseEvent) => void
}

export function TrackOverlay({ points, mapInstance, onPointClick }: TrackOverlayProps) {
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!points.length || points.length < 2) return

    const layer = L.layerGroup()

    const coords: Array<[number, number]> = points.map((p) => [p.latitude, p.longitude] as [number, number])

    const polyline = L.polyline(coords, {
      color: '#2563eb',
      weight: 3,
      opacity: 0.8,
    })
    layer.addLayer(polyline)

    const startIcon = L.divIcon({
      className: 'track-marker start',
      html: '<div style="width:12px;height:12px;background:#22c55e;border:2px solid #fff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })
    L.marker(coords[0], { icon: startIcon }).addTo(layer)

    const endIcon = L.divIcon({
      className: 'track-marker end',
      html: '<div style="width:12px;height:12px;background:#ef4444;border:2px solid #fff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })
    L.marker(coords[coords.length - 1], { icon: endIcon }).addTo(layer)

    const bounds = L.latLngBounds(coords)
    mapInstance.fitBounds(bounds)

    layer.addTo(mapInstance)

    const clickable = L.polyline(coords, {
      color: '#fff',
      weight: 20,
      interactive: true,
      opacity: 0,
    })
    clickable.on('click', (e: L.LeafletMouseEvent) => {
      if (!onPointClick || points.length === 0) return

      const clickLatLng = e.latlng
      let minDist = Infinity
      let nearestPoint: TrackPoint | null = null
      for (const pt of points) {
        const dist = calculateHaversineDistance(
          { latitude: clickLatLng.lat, longitude: clickLatLng.lng },
          { latitude: pt.latitude, longitude: pt.longitude },
        )
        if (dist < minDist) {
          minDist = dist
          nearestPoint = pt
        }
      }

      if (nearestPoint) {
        onPointClick(nearestPoint, e)
      }
    })
    clickable.addTo(layer)

    layerRef.current = layer

    return () => {
      layer.remove()
      layerRef.current = null
    }
  }, [points, mapInstance, onPointClick])

  return null
}
