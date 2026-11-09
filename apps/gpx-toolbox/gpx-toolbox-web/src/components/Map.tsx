import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import { LocateControl } from 'leaflet.locatecontrol'
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

import { mapLocateCircleFill, mapLocateMarkerFill, mapLocateMarkerRing } from '../utils/routeColors'

/**
 * Leaflet derives the default marker image path from the CSS background URL of `.leaflet-default-icon-path`.
 * Vite inlines that image as a data URL in production builds, which breaks the derivation, so set the URLs explicitly.
 */
L.Icon.Default.imagePath = ''
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
})

/** Fallback center (Stuttgart) when the browser location is unavailable */
export const defaultCenter: [number, number] = [48.77, 9.16]

/** Basemap tile layers for the layer switcher */
const tileLayers: Record<string, string> = {
  OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
}

/**
 * Style of the "my location" dot. The plugin's marker draws a circle using `radius`,
 * but its typings only allow `PathOptions | MarkerOptions`, hence the separate constant.
 */
const locateMarkerStyle: L.CircleMarkerOptions = {
  radius: 5,
  color: mapLocateMarkerRing,
  fillColor: mapLocateMarkerFill,
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
  const { t } = useTranslation()
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
            : '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
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
      strings: { title: t('map.locateTitle') },
      flyTo: true,
      markerStyle: locateMarkerStyle,
      circleStyle: {
        color: mapLocateMarkerRing,
        fillColor: mapLocateCircleFill,
        fillOpacity: 0.1,
        weight: 1,
      },
    }).addTo(map)

    // Children (e.g. track overlays) — rendered by their own React components that directly manipulate the map
    if (children) {
      // Children render themselves; nothing for Leaflet to manage here
    }

    // Leaflet finishes a zoom animation (e.g. from fitBounds) in a timeout that crashes if the map was
    // removed in the meantime, so a map that is still zooming is removed once the animation ended
    let isZooming = false
    map.on('zoomanim', () => (isZooming = true)).on('zoomend', () => (isZooming = false))

    mapInstanceRef.current = map
    if (mapRefRef.current) mapRefRef.current.current = map
    onMapReadyRef.current?.(map)

    return () => {
      if (isZooming) map.once('zoomend', () => map.remove())
      else map.remove()
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
