import { useRef, useState, useEffect } from 'react'
import L from 'leaflet'

import type { TrackPoint } from '@plusone/gpx'
import { calculateHaversineDistance, renderSvg } from '@plusone/gpx'

import { Map } from './Map'
import { SegmentOverlay } from './SegmentOverlay'
import { Sidebar } from './Sidebar'
import { PointDetails } from './PointDetails'

export function GPXViewer() {
  const [points, setPoints] = useState<Array<TrackPoint>>([])
  const [fileName, setFileName] = useState<string>()
  const mapRef = useRef<L.Map | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ point: TrackPoint; event: L.LeafletMouseEvent } | null>(null)
  const [segmentRange, setSegmentRange] = useState<[number, number]>([0, 100])

  function handleLoad(trackPoints: Array<TrackPoint>, name: string) {
    setPoints(trackPoints)
    setFileName(name)
    setSelectedPoint(null)
    setSegmentRange([0, 100])
  }

  function handlePointClick(point: TrackPoint, event: L.LeafletMouseEvent) {
    setSelectedPoint((prev) => {
      if (prev?.point === point) return null
      return { point, event }
    })
  }

  function handleExportGpx(trackPoints: Array<TrackPoint>) {
    const trkpts = trackPoints
      .map(
        (p) =>
          `    <trkpt lat="${p.latitude}" lon="${p.longitude}">
      <ele>${p.elevation}</ele>
      <time>${p.time.toISOString()}</time>
    </trkpt>`,
      )
      .join('\n')

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX-Toolbox" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`

    const blob = new Blob([gpx], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'segment.gpx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleExportSvg(trackPoints: Array<TrackPoint>) {
    const { svg } = renderSvg({ points: trackPoints, rotate: true })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'segment.svg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      <Sidebar
        onFileLoad={handleLoad}
        points={points}
        fileName={fileName}
        segmentRange={segmentRange}
        onSegmentRangeChange={setSegmentRange}
        onExportGpx={handleExportGpx}
        onExportSvg={handleExportSvg}
      />
      <div style={styles.mapArea}>
        <Map mapRef={mapRef} />
        {points.length > 1 && segmentRange[1] - segmentRange[0] >= 1 && mapRef.current && (
          <SegmentOverlay
            points={points}
            mapInstance={mapRef.current}
            range={segmentRange}
            fitBounds={segmentRange[0] === 0 && segmentRange[1] === 100}
          >
            {segmentRange[1] - segmentRange[0] >= 1 && (
              <TrackClickHandler
                points={points}
                range={segmentRange}
                mapInstance={mapRef.current}
                onPointClick={handlePointClick}
              />
            )}
          </SegmentOverlay>
        )}
      </div>
      {selectedPoint && <PointDetails point={selectedPoint.point} />}
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
  onPointClick: (point: TrackPoint, event: L.LeafletMouseEvent) => void
}) {
  const layerRef = useRef<L.LayerGroup | null>(null)

  const startIdx = Math.round((range[0] / 100) * (points.length - 1))
  const endIdx = Math.round((range[1] / 100) * (points.length - 1))
  const visiblePoints = points.slice(startIdx, endIdx + 1)

  useEffect(() => {
    if (visiblePoints.length < 2) return

    const layer = L.layerGroup()

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
        onPointClick(nearestPoint, e)
      }
    })

    clickable.addTo(layer)
    layerRef.current = layer

    return () => {
      layer.remove()
      layerRef.current = null
    }
  }, [visiblePoints, mapInstance, onPointClick])

  return null
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },
} as const
