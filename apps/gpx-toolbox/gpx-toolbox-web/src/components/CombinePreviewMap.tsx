import { useCallback, useEffect, useRef } from 'react'
import L from 'leaflet'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { type ProfileHover } from '../components/CompareElevationProfile'
import { useCombineState } from '../hooks/useCombineState'
import { routeStyle } from '../utils/routeColors'
import { slicePointsByDistance } from '../utils/track'

// Color for via point markers
const viaPointColor = '#f59e0b'
// Color for the combined route (must match combine.tsx)
const combinedRouteColor = '#22c55e'

// Colors for segment types
const segmentTypeColor: Record<string, string> = {
  uphill: '#e53935',
  downhill: '#43a047',
  flat: '#1e88e5',
}

type CombinePreviewMapProps = {
  mapInstance: L.Map
  hover?: ProfileHover | null
}

export function CombinePreviewMap({ mapInstance, hover }: CombinePreviewMapProps) {
  const layerRef = useRef<L.LayerGroup | null>(null)
  const hasAutoFit = useRef(false)
  const {
    orderedSegments,
    getSegmentPoints,
    sourceRoutes,
    hoveredSegmentId,
    hoveredGapFillId,
    gapFills,
    addGapFillViaPoint,
    removeGapFillViaPoint,
    updateGapFillViaPoint,
  } = useCombineState()

  const handleAddViaPoint = useCallback(
    (e: L.LeafletMouseEvent) => {
      // Find which gap fill the click is closest to (use the first gap fill for now)
      // The gap fill is identified by the click event's latlng
      const { lat, lng } = e.latlng

      // Find the gap fill whose gap line is closest to the click
      let bestGapFill: (typeof gapFills)[0] | null = null
      let bestDist = Infinity

      for (const fill of gapFills) {
        // Estimate distance from click to the midpoint of the gap
        const midLat = (fill.from.latitude + fill.to.latitude) / 2
        const midLng = (fill.from.longitude + fill.to.longitude) / 2
        const dist = Math.sqrt(Math.pow(lat - midLat, 2) + Math.pow(lng - midLng, 2))
        if (dist < bestDist) {
          bestDist = dist
          bestGapFill = fill
        }
      }

      if (bestGapFill && bestDist < 0.05) {
        addGapFillViaPoint(bestGapFill.id, {
          latitude: lat,
          longitude: lng,
          elevation: 0,
          time: new Date(),
        })
      }
    },
    [gapFills, addGapFillViaPoint],
  )

  useEffect(() => {
    // Cleanup previous layer
    if (layerRef.current) {
      layerRef.current.remove()
      layerRef.current = null
    }

    const layer = L.layerGroup()
    const allCoords: Array<[number, number]> = []

    // Draw full source routes as dashed lines (each with its own color)
    let routeIndex = 0
    sourceRoutes.forEach((source) => {
      if (source.points.length < 2) return
      const coords = source.points.map((p) => [p.latitude, p.longitude] as [number, number])
      const style = routeStyle(routeIndex++)
      const fullRouteLine = L.polyline(coords, {
        color: style.color,
        weight: 3,
        opacity: 0.8,
        dashArray: style.dashArray,
      })
      layer.addLayer(fullRouteLine)
    })

    // When a segment is hovered, draw it even if not yet selected
    // segId format: `${routeId}-${segmentIndex}`, routeId is a UUID with dashes
    if (hoveredSegmentId) {
      const lastDash = hoveredSegmentId.lastIndexOf('-')
      const hoveredRouteId = hoveredSegmentId.slice(0, lastDash)
      const hoveredIndex = parseInt(hoveredSegmentId.slice(lastDash + 1), 10)
      const hoveredSource = sourceRoutes.get(hoveredRouteId)
      if (hoveredSource && hoveredSource.segments[hoveredIndex]) {
        const hoveredSeg = hoveredSource.segments[hoveredIndex]
        if (hoveredSeg.points.length >= 2) {
          // Check if the segment is already selected — then only show the slider-selected part
          const selectedSegment = orderedSegments.find((s) => s.id === hoveredSegmentId)
          let hoverPoints: Array<TrackPoint>
          if (selectedSegment) {
            // Use the slider-selected points (like getSegmentPoints)
            const segmentDistance = selectedSegment.distance / 1000
            hoverPoints = slicePointsByDistance(selectedSegment.points, [
              selectedSegment.startKm,
              Math.min(selectedSegment.endKm, segmentDistance),
            ])
          } else {
            // Not selected — show the full segment
            hoverPoints = hoveredSeg.points
          }
          if (hoverPoints.length >= 2) {
            const hoveredCoords = hoverPoints.map((p) => [p.latitude, p.longitude] as [number, number])
            const hoveredType = (hoveredSeg.type ?? 'flat') as string
            const hoveredColor = segmentTypeColor[hoveredType] ?? segmentTypeColor.flat
            const hoveredLine = L.polyline(hoveredCoords, {
              color: hoveredColor,
              weight: 7,
              opacity: 1,
            })
            layer.addLayer(hoveredLine)
          }
        }
      }
    }

    if (orderedSegments.length === 0) {
      layer.addTo(mapInstance)
      layerRef.current = layer
      return () => {
        layer.remove()
        layerRef.current = null
      }
    }

    // Draw all segments and gaps
    for (let i = 0; i < orderedSegments.length; i++) {
      const segment = orderedSegments[i]
      const points = getSegmentPoints(segment)

      if (points.length < 2) continue

      const coords = points.map((p) => [p.latitude, p.longitude] as [number, number])
      allCoords.push(...coords)

      const color = segmentTypeColor[segment.type] ?? segmentTypeColor.flat
      const isHovered = segment.id === hoveredSegmentId

      // Segment as polyline (hovered segment thicker and brighter)
      const polyline = L.polyline(coords, {
        color,
        weight: isHovered ? 10 : 8,
        opacity: isHovered ? 1 : 0.9,
      })
      layer.addLayer(polyline)

      // Numbered marker at the start of each segment
      const segmentNumber = i + 1
      const segmentIcon = L.divIcon({
        className: 'combine-segment-marker',
        html: `<div style="width:22px;height:22px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;font-family:sans-serif">${segmentNumber}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })
      L.marker(coords[0], { icon: segmentIcon }).addTo(layer)

      // Gap to next segment — use GapFill from the store
      if (i < orderedSegments.length - 1) {
        const nextSegment = orderedSegments[i + 1]
        const gapFill = gapFills.find((f) => f.prevSegmentId === segment.id && f.nextSegmentId === nextSegment.id)

        if (gapFill) {
          const isGapHovered = gapFill.id === hoveredGapFillId
          if (gapFill.routePoints && gapFill.routePoints.length >= 2) {
            // Calculated route as solid line (hovered thicker and brighter)
            const routeCoords = gapFill.routePoints.map((p) => [p.latitude, p.longitude] as [number, number])
            const routeLine = L.polyline(routeCoords, {
              color: '#8b5cf6',
              weight: isGapHovered ? 10 : 8,
              opacity: isGapHovered ? 1 : 0.8,
            })
            layer.addLayer(routeLine)
            allCoords.push(...routeCoords)

            // Lettered marker at ~10% of the calculated route (away from via points at midpoint)
            const labelIndex = Math.floor(routeCoords.length * 0.1)
            const labelCoord = routeCoords[labelIndex]
            const gapLabel = String.fromCharCode(65 + i)
            const gapIcon = L.divIcon({
              className: 'combine-gap-marker',
              html: `<div style="width:22px;height:22px;background:#8b5cf6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;font-family:sans-serif">${gapLabel}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })
            L.marker(labelCoord, { icon: gapIcon }).addTo(layer)
          } else {
            // Not yet calculated — dashed line as placeholder (hovered thicker and brighter)
            const lastPoint = coords[coords.length - 1]
            const firstNextPoint = [gapFill.to.latitude, gapFill.to.longitude] as [number, number]
            const gapLine = L.polyline([lastPoint, firstNextPoint], {
              color: '#8b5cf6',
              weight: isGapHovered ? 4 : 2,
              opacity: isGapHovered ? 0.8 : 0.5,
              dashArray: '8, 8',
            })
            layer.addLayer(gapLine)

            // Lettered marker at ~10% of the dashed placeholder (away from via points at midpoint)
            const labelLat = lastPoint[0] + (firstNextPoint[0] - lastPoint[0]) * 0.1
            const labelLng = lastPoint[1] + (firstNextPoint[1] - lastPoint[1]) * 0.1
            const gapLabel = String.fromCharCode(65 + i)
            const gapIcon = L.divIcon({
              className: 'combine-gap-marker',
              html: `<div style="width:22px;height:22px;background:#8b5cf6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;font-family:sans-serif">${gapLabel}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })
            L.marker([labelLat, labelLng], { icon: gapIcon }).addTo(layer)
          }
        }
      }
    }

    // Start and end markers for the entire combined route
    if (allCoords.length >= 2) {
      const startIcon = L.divIcon({
        className: 'track-marker start',
        html: '<div style="width:14px;height:14px;background:#22c55e;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(allCoords[0], { icon: startIcon }).addTo(layer)

      const endIcon = L.divIcon({
        className: 'track-marker end',
        html: '<div style="width:14px;height:14px;background:#ef4444;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(allCoords[allCoords.length - 1], { icon: endIcon }).addTo(layer)

      // Center map only once when segments are first loaded
      if (!hasAutoFit.current && orderedSegments.length > 0) {
        hasAutoFit.current = true
        const bounds = L.latLngBounds(allCoords)
        mapInstance.fitBounds(bounds, { padding: [30, 30] })
      }
    }

    // Double-click on the map adds a via point (only near a gap)
    const onDoubleClick = (e: L.LeafletMouseEvent) => {
      handleAddViaPoint(e)
    }
    mapInstance.on('dblclick', onDoubleClick)

    layer.addTo(mapInstance)
    layerRef.current = layer

    return () => {
      layer.remove()
      layerRef.current = null
      mapInstance.off('dblclick', onDoubleClick)
    }
  }, [
    orderedSegments,
    getSegmentPoints,
    sourceRoutes,
    hoveredSegmentId,
    hoveredGapFillId,
    gapFills,
    mapInstance,
    handleAddViaPoint,
  ])

  // ─── Via point markers (separate effect to avoid re-creating on every gapFill change) ───

  const viaMarkerRefs = useRef<Map<string, Array<L.Marker>>>(new Map())

  useEffect(() => {
    // Cleanup old via markers
    viaMarkerRefs.current.forEach((markers) => markers.forEach((m) => m.remove()))
    viaMarkerRefs.current.clear()

    const viaMarkersByGap: Map<string, Array<L.Marker>> = new Map()

    for (const fill of gapFills) {
      const markers: Array<L.Marker> = []

      fill.viaPoints.forEach((vp, viaIndex) => {
        const viaNumber = viaIndex + 1
        const viaIcon = L.divIcon({
          className: 'gap-via-marker',
          html: `<div style="width:22px;height:22px;background:${viaPointColor};border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4);cursor:move;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;font-family:sans-serif">${viaNumber}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })

        const marker = L.marker([vp.latitude, vp.longitude], {
          icon: viaIcon,
          draggable: true,
        }).addTo(mapInstance)

        // Drag handler: update the via point position in the store
        // Use a ref-based approach to avoid re-creating the effect
        marker.on('dragend', () => {
          const latlng = marker.getLatLng()
          updateGapFillViaPoint(fill.id, viaIndex, {
            latitude: latlng.lat,
            longitude: latlng.lng,
            elevation: 0,
            time: new Date(),
          })
        })

        // Double-click on marker removes it
        marker.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e)
          removeGapFillViaPoint(fill.id, viaIndex)
        })

        markers.push(marker)
      })

      if (markers.length > 0) {
        viaMarkersByGap.set(fill.id, markers)
      }
    }
    viaMarkerRefs.current = viaMarkersByGap

    return () => {
      viaMarkersByGap.forEach((markers) => markers.forEach((m) => m.remove()))
      viaMarkerRefs.current.clear()
    }
  }, [
    // Only re-create markers when the structure changes (gap fill IDs or via point counts),
    // not when via point coordinates change (those are updated in-place by dragend)
    gapFills.map((f) => `${f.id}:${f.viaPoints.length}`).join(','),
    mapInstance,
    updateGapFillViaPoint,
    removeGapFillViaPoint,
  ])

  // Hover markers from elevation profile — separate effect so segments are not redrawn on every hover
  const colorById = useRef(new Map<string, string>())
  useEffect(() => {
    // Collect colors of source routes (must match combine.tsx)
    const map = new Map<string, string>()
    let index = 0
    sourceRoutes.forEach((_, routeId) => {
      const style = routeStyle(index++)
      map.set(routeId, style.color)
    })
    map.set('combined-route', combinedRouteColor)
    colorById.current = map
  }, [sourceRoutes])

  useEffect(() => {
    if (!mapInstance || !hover) return
    const markers = hover.map(({ id, point }) =>
      L.circleMarker([point.latitude, point.longitude], {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: colorById.current.get(id) ?? combinedRouteColor,
        fillOpacity: 1,
        interactive: false,
      }).addTo(mapInstance),
    )
    return () => markers.forEach((m) => m.remove())
  }, [mapInstance, hover])

  return null
}
