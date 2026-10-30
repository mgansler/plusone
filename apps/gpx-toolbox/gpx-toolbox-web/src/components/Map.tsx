import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import { LocateControl } from 'leaflet.locatecontrol'

/** Fallback center (Stuttgart) when the browser location is unavailable */
export const defaultCenter: [number, number] = [48.77, 9.16]

/** Basemap tile layers for the layer switcher */
const tileLayers: Record<string, string> = {
  OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  Topografisch: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
}

/**
 * Style of the "my location" dot. The plugin's marker draws a circle using `radius`,
 * but its typings only allow `PathOptions | MarkerOptions`, hence the separate constant.
 */
const locateMarkerStyle: L.CircleMarkerOptions = {
  radius: 5,
  color: '#3b82f6',
  fillColor: '#60a5fa',
  fillOpacity: 0.9,
  weight: 2,
}

type MapProps = {
  children?: ReactNode
  center?: [number, number]
  zoom?: number
  mapRef?: RefObject<L.Map | null>
  onMapReady?: (map: L.Map | null) => void
}

export function Map({ children, center, zoom = 12, mapRef, onMapReady }: MapProps) {
  const [initCenter, setInitCenter] = useState<[number, number] | null>(null)
  const mapDomRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  // Stable refs to prevent map recreation on every render
  const mapRefRef = useRef(mapRef)
  mapRefRef.current = mapRef
  const onMapReadyRef = useRef(onMapReady)
  onMapReadyRef.current = onMapReady

  // Initial centering from browser location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setInitCenter([pos.coords.latitude, pos.coords.longitude] as [number, number]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        { timeout: 3000 },
      )
    }
  }, [])

  const effectiveCenter = center ?? initCenter ?? defaultCenter

  // ── Map creation (runs once per DOM mount) ────────────────────────────────
  useEffect(() => {
    if (!mapDomRef.current || mapInstanceRef.current) return

    const map = L.map(mapDomRef.current).setView(effectiveCenter, zoom)

    // Basemap layers for layer switcher
    const baseLayers: Record<string, L.TileLayer> = {}
    for (const [name, url] of Object.entries(tileLayers)) {
      baseLayers[name] = L.tileLayer(url, {
        attribution:
          name === 'OpenStreetMap'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : name === 'Satellite'
              ? '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              : '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &mdash; ODbL',
        maxZoom: 17,
        minZoom: 8,
      })
    }
    baseLayers['OpenStreetMap'].addTo(map)

    // Layer switcher
    L.control.layers(baseLayers).addTo(map)

    // Scale control (metric + imperial)
    L.control.scale({ imperial: true, position: 'bottomleft' }).addTo(map)

    // Locate control (leaflet-locatecontrol plugin)
    new LocateControl({
      position: 'topleft',
      strings: { title: 'Zu meinem Standort' },
      flyTo: true,
      markerStyle: locateMarkerStyle,
      circleStyle: {
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.1,
        weight: 1,
      },
    }).addTo(map)

    // Children (e.g. track overlays) — rendered by their own React components that directly manipulate the map
    if (children) {
      // Children render themselves; nothing for Leaflet to manage here
    }

    mapInstanceRef.current = map
    if (mapRefRef.current) mapRefRef.current.current = map
    onMapReadyRef.current?.(map)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      if (mapRefRef.current) mapRefRef.current.current = null
      onMapReadyRef.current?.(null)
    }
  }, [mapDomRef])

  return (
    <div ref={mapDomRef} style={styles.map}>
      {children}
    </div>
  )
}

const styles = {
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0,
  },
} as const
