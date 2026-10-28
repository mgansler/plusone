import { useCallback, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'

import { calculateHaversineDistance, type TrackPoint } from '@plusone/gpx-toolbox-utils'

import { slicePointsByDistance } from '../utils/track'

import { Map } from './Map'
import { SegmentOverlay } from './SegmentOverlay'
import { PointDetails } from './PointDetails'

type SegmentMapProps = {
  points: Array<TrackPoint>
  /** Selected segment in km, [startKm, endKm] */
  range: [number, number]
  /** Total track distance in km */
  totalDistKm: number
}

/**
 * Map showing the full track greyed out with the selected segment highlighted.
 * Clicking the segment shows details for the nearest track point.
 */
export function SegmentMap({ points, range, totalDistKm }: SegmentMapProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<TrackPoint | null>(null)

  useEffect(() => {
    setSelectedPoint(null)
  }, [points])

  const handlePointClick = useCallback((point: TrackPoint) => {
    setSelectedPoint((prev) => (prev === point ? null : point))
  }, [])

  const showSegment = points.length > 1 && range[1] - range[0] >= 0.01

  return (
    <div style={styles.mapArea}>
      <Map onMapReady={setMapInstance} />
      {showSegment && mapInstance && (
        <SegmentOverlay
          points={points}
          mapInstance={mapInstance}
          range={range}
          totalDistKm={totalDistKm}
          fitBounds={range[0] === 0 && range[1] >= totalDistKm}
        >
          <TrackClickHandler points={points} range={range} mapInstance={mapInstance} onPointClick={handlePointClick} />
        </SegmentOverlay>
      )}
      {selectedPoint && <PointDetails point={selectedPoint} onClose={() => setSelectedPoint(null)} />}
    </div>
  )
}

/** Invisible click handler that maps clicks to the nearest track point in the selected range */
function TrackClickHandler({
  points,
  range,
  mapInstance,
  onPointClick,
}: {
  points: Array<TrackPoint>
  range: [number, number]
  mapInstance: L.Map
  onPointClick: (point: TrackPoint) => void
}) {
  const visiblePoints = useMemo(() => slicePointsByDistance(points, range), [points, range])

  useEffect(() => {
    if (visiblePoints.length < 2) return

    const coords: Array<[number, number]> = visiblePoints.map((p) => [p.latitude, p.longitude] as [number, number])

    const clickable = L.polyline(coords, {
      color: '#fff',
      weight: 20,
      interactive: true,
      opacity: 0,
    })

    clickable.on('click', (e: L.LeafletMouseEvent) => {
      const clickLatLng = e.latlng
      let minDist = Infinity
      let nearestPoint: TrackPoint | null = null
      for (const pt of visiblePoints) {
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
        onPointClick(nearestPoint)
      }
    })

    clickable.addTo(mapInstance)

    return () => {
      clickable.remove()
    }
  }, [visiblePoints, mapInstance, onPointClick])

  return null
}

const styles = {
  mapArea: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },
} as const
