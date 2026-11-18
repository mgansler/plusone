import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'

import { getRoutes } from '@plusone/gpx-toolbox-api-client'
import { parseGpx } from '@plusone/gpx-toolbox-utils'

import { mapEndMarker, mapStartMarker, routeStyle } from '../utils/routeColors'

import { Map } from './Map'

type Mode = 'none' | 'start' | 'end' | 'via' | 'copy'

/**
 * Route planner tool: click Start and End on the map, then calculate a route via BRouter.
 * The resulting track is displayed on the map.
 * Includes a "Copy Coordinates" button to copy any map point to the clipboard.
 */
export function RoutePlannerMap() {
  const [mode, setMode] = useState<Mode>('none')
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null)
  const [viaPoints, setViaPoints] = useState<Array<[number, number]>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routeCoords, setRouteCoords] = useState<Array<Array<[number, number]>>>([])
  const [copiedCoords, setCopiedCoords] = useState<[number, number] | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const startMarkerRef = useRef<L.Marker | null>(null)
  const endMarkerRef = useRef<L.Marker | null>(null)
  const viaMarkerRefs = useRef<Array<L.Marker>>([])
  const routeLayersRef = useRef<Array<L.Polyline>>([])
  const copyMarkerRef = useRef<L.Marker | null>(null)

  const handleMapReady = useCallback((map: L.Map | null) => {
    mapRef.current = map
  }, [])

  // Clean up markers when mode changes
  useEffect(() => {
    if (mode !== 'none') {
      // Mode changed to start/end — keep existing markers
    }
  }, [mode])

  // Draw routes on map
  useEffect(() => {
    if (!mapRef.current || routeCoords.length === 0) return
    const map = mapRef.current

    // Remove previous route layers
    routeLayersRef.current.forEach((layer) => layer.remove())
    routeLayersRef.current = []

    const allCoords: Array<[number, number]> = []

    routeCoords.forEach((coords, index) => {
      if (coords.length < 2) return

      const style = routeStyle(index)
      const polyline = L.polyline(coords, {
        color: style.color,
        dashArray: style.dashArray,
        weight: 4,
        opacity: 0.9,
      }).addTo(map)

      routeLayersRef.current.push(polyline)
      allCoords.push(...coords)
    })

    // Fit bounds to all routes
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords)
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      routeLayersRef.current.forEach((layer) => layer.remove())
      routeLayersRef.current = []
    }
  }, [routeCoords])

  // Handle map clicks
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    if (mode === 'none') {
      map.getContainer().style.cursor = ''
      return
    }

    // Change cursor to indicate clickability
    map.getContainer().style.cursor = 'crosshair'

    const onClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      const coords: [number, number] = [lat, lng]

      if (mode === 'start') {
        // Remove previous start marker
        if (startMarkerRef.current) {
          startMarkerRef.current.remove()
        }

        const marker = createMarker(mapStartMarker).addTo(map)
        marker.setLatLng(coords)
        startMarkerRef.current = marker
        setStartPoint(coords)
        setMode('none')
      } else if (mode === 'end') {
        // Remove previous end marker
        if (endMarkerRef.current) {
          endMarkerRef.current.remove()
        }

        const marker = createMarker(mapEndMarker).addTo(map)
        marker.setLatLng(coords)
        endMarkerRef.current = marker
        setEndPoint(coords)
        setMode('none')
      } else if (mode === 'via') {
        // Add via point marker with number
        const viaColor = '#f59e0b'
        const viaIndex = viaMarkerRefs.current.length
        const viaNumber = viaIndex + 1
        const viaIcon = L.divIcon({
          className: 'route-planner-via-marker',
          html: `<div style="width:22px;height:22px;background:${viaColor};border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4);cursor:move;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;font-family:sans-serif">${viaNumber}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })
        const newMarker = L.marker(coords, { icon: viaIcon, draggable: true }).addTo(map)

        // Make marker draggable
        newMarker.on('dragend', () => {
          const ll = newMarker.getLatLng()
          setViaPoints((prev) => {
            const idx = viaMarkerRefs.current.indexOf(newMarker)
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = [ll.lat, ll.lng]
            return next
          })
        })

        // Double-click to remove
        newMarker.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e)
          setViaPoints((prev) => {
            const idx = viaMarkerRefs.current.indexOf(newMarker)
            if (idx === -1) return prev
            newMarker.remove()
            viaMarkerRefs.current.splice(idx, 1)
            return prev.filter((_, i) => i !== idx)
          })
        })

        viaMarkerRefs.current.push(newMarker)
        setViaPoints((prev) => [...prev, coords])
        // Stay in via mode so user can add multiple points
      } else if (mode === 'copy') {
        // Remove previous copy marker
        if (copyMarkerRef.current) {
          copyMarkerRef.current.remove()
        }

        // Add marker at clicked position
        const newMarker = L.marker([lat, lng]).addTo(map)
        copyMarkerRef.current = newMarker

        // Copy coordinates to clipboard
        const coordsText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        navigator.clipboard
          .writeText(coordsText)
          .then(() => {
            setCopiedCoords([lat, lng])
            setMode('none')
          })
          .catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea')
            textarea.value = coordsText
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopiedCoords([lat, lng])
            setMode('none')
          })
      }
    }

    map.on('click', onClick)

    return () => {
      map.off('click', onClick)
      map.getContainer().style.cursor = ''
    }
  }, [mode])

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError('Wähle zuerst Start und Ende aus.')
      return
    }

    setLoading(true)
    setError(null)
    setRouteCoords([])

    try {
      const allPoints = [
        { latitude: startPoint[0], longitude: startPoint[1] },
        ...viaPoints.map((p) => ({ latitude: p[0], longitude: p[1] })),
        { latitude: endPoint[0], longitude: endPoint[1] },
      ]
      const response = await getRoutes({
        points: allPoints,
      })

      // Parse all GPX routes and extract coordinates
      const allCoords: Array<Array<[number, number]>> = []

      for (const route of response.routes) {
        const points = parseGpx(route.gpx)
        const coords = points.map((p) => [p.latitude, p.longitude] as [number, number])
        if (coords.length >= 2) {
          allCoords.push(coords)
        }
      }

      setRouteCoords(allCoords)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Fehler beim Berechnen der Route')
      } else {
        setError('Fehler beim Berechnen der Route')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (startMarkerRef.current) {
      startMarkerRef.current.remove()
      startMarkerRef.current = null
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove()
      endMarkerRef.current = null
    }
    viaMarkerRefs.current.forEach((m) => m.remove())
    viaMarkerRefs.current = []
    routeLayersRef.current.forEach((layer) => layer.remove())
    routeLayersRef.current = []
    setStartPoint(null)
    setEndPoint(null)
    setViaPoints([])
    setRouteCoords([])
    setError(null)
  }

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button
          style={{
            ...styles.button,
            ...(mode === 'copy' ? styles.buttonCopyActive : {}),
          }}
          onClick={() => {
            setMode(mode === 'copy' ? 'none' : 'copy')
            setCopiedCoords(null)
          }}
        >
          {mode === 'copy' ? '✕ Abbrechen' : '📋 Koordinaten kopieren'}
        </button>
        <div style={styles.separator} />
        <button
          style={{
            ...styles.button,
            ...(mode === 'start' ? styles.buttonActive : {}),
            ...(startPoint ? styles.buttonDone : {}),
          }}
          onClick={() => setMode(mode === 'start' ? 'none' : 'start')}
        >
          {startPoint ? '✓ Start ändern' : mode === 'start' ? '✕ Abbrechen' : '📍 Start festlegen'}
        </button>
        <button
          style={{
            ...styles.button,
            ...(mode === 'end' ? styles.buttonActive : {}),
            ...(endPoint ? styles.buttonDone : {}),
          }}
          onClick={() => setMode(mode === 'end' ? 'none' : 'end')}
        >
          {endPoint ? '✓ Ende ändern' : mode === 'end' ? '✕ Abbrechen' : '📍 Ende festlegen'}
        </button>
        <button
          style={{
            ...styles.button,
            ...(mode === 'via' ? styles.buttonViaActive : {}),
          }}
          onClick={() => setMode(mode === 'via' ? 'none' : 'via')}
        >
          {mode === 'via' ? '✕ Abbrechen' : '⋮ Zwischenpunkt'}
        </button>
        <button
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            opacity: startPoint && endPoint ? 1 : 0.5,
          }}
          onClick={handleCalculateRoute}
          disabled={!startPoint || !endPoint || loading}
        >
          {loading ? '⏳ Berechnung...' : '🗺️ Route berechnen'}
        </button>
        {viaPoints.length > 0 && (
          <span style={styles.viaCount}>
            ⋮ {viaPoints.length} Zwischenpunkt{viaPoints.length !== 1 ? 'e' : ''}
          </span>
        )}
        {(startPoint || endPoint || viaPoints.length > 0 || routeCoords.some((r) => r.length > 0)) && (
          <button style={styles.buttonReset} onClick={handleReset}>
            ↺ Zurücksetzen
          </button>
        )}
        {mode !== 'none' && (
          <span style={styles.hint}>
            {mode === 'start'
              ? 'Klicke auf die Karte, um den Startpunkt zu setzen'
              : mode === 'end'
                ? 'Klicke auf die Karte, um den Endpunkt zu setzen'
                : mode === 'via'
                  ? 'Klicke auf die Karte, um Zwischenpunkte hinzuzufügen (doppelklick auf Marker zum Entfernen)'
                  : 'Klicke auf die Karte, um die Koordinaten zu kopieren'}
          </span>
        )}
        {copiedCoords && mode !== 'copy' && (
          <span style={styles.copied}>
            ✓ Kopiert: {copiedCoords[0].toFixed(6)}, {copiedCoords[1].toFixed(6)}
          </span>
        )}
        {error && <span style={styles.error}>⚠ {error}</span>}
      </div>
      <Map onMapReady={handleMapReady} />
    </div>
  )
}

function createMarker(color: string): L.Marker {
  const icon = L.divIcon({
    className: 'route-planner-marker',
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
  return L.marker([0, 0], { icon })
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
  } as const,
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    zIndex: 1000,
    flexWrap: 'wrap' as const,
  } as const,
  button: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  } as const,
  buttonActive: {
    background: '#ef4444',
  } as const,
  buttonCopyActive: {
    background: '#ef4444',
  } as const,
  buttonViaActive: {
    background: '#f59e0b',
  } as const,
  buttonDone: {
    background: '#22c55e',
  } as const,
  buttonPrimary: {
    background: '#f59e0b',
  } as const,
  separator: {
    width: '1px',
    height: '24px',
    background: '#334155',
    margin: '0 4px',
  } as const,
  buttonReset: {
    padding: '8px 16px',
    background: '#64748b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    marginLeft: 'auto',
  } as const,
  hint: {
    color: '#94a3b8',
    fontSize: '14px',
  } as const,
  error: {
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: 500,
  } as const,
  copied: {
    color: '#22c55e',
    fontSize: '14px',
    fontWeight: 500,
  } as const,
  viaCount: {
    color: '#f59e0b',
    fontSize: '14px',
    fontWeight: 500,
  } as const,
} as const
