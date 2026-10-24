import { useState, useEffect, useRef, type ReactNode, type RefObject } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../lib/L.Control.Locate.min.css'
import 'leaflet-locatecontrol'

const defaultCenter: [number, number] = [48.77, 9.16]

/** Basemap tile layers for the layer switcher */
const tileLayers: Record<string, string> = {
  OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  Topografisch: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
}

type MapProps = {
  children?: ReactNode
  center?: [number, number]
  zoom?: number
  mapRef?: RefObject<L.Map | null>
}

export function Map({ children, center, zoom = 12, mapRef }: MapProps) {
  const [initCenter, setInitCenter] = useState<[number, number] | null>(null)
  const mapDomRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

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
    ;(L.control as any).layers(baseLayers).addTo(map)

    // Scale control (metric + imperial)
    ;(L.control as any).scale({ imperial: true, position: 'bottomleft' }).addTo(map)

    // Locate control (leaflet-locatecontrol plugin)
    ;(L.control as any)
      .locate({
        position: 'topleft',
        strings: { title: 'Zu meinem Standort' },
        flyTo: true,
        flyToZoom: 15,
        follow: true,
        followMode: 'jump',
        markerStyle: {
          radius: 5,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.9,
          weight: 2,
        },
        circleStyle: {
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.1,
          weight: 1,
        },
      } as any)
      .addTo(map)

    // Children (e.g. track overlays) — rendered by their own React components that directly manipulate the map
    if (children) {
      // Children render themselves; nothing for Leaflet to manage here
    }

    mapInstanceRef.current = map
    if (mapRef) mapRef.current = map

    return () => {
      if ((map as any)._gpxLayer) {
        map.removeLayer((map as any)._gpxLayer)
      }
      map.remove()
      mapInstanceRef.current = null
      if (mapRef) mapRef.current = null
    }
  }, [effectiveCenter[0], effectiveCenter[1], zoom, mapRef, initCenter, children])

  return <div ref={mapDomRef} style={styles.map} />
}

const styles = {
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0,
  },
} as const
