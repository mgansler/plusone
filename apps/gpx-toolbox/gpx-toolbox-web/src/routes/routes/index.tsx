import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type L from 'leaflet'

import { useListRoutes } from '@plusone/gpx-toolbox-api-client'

import { CompareBar } from '../../components/CompareBar'
import { COORDINATE_DECIMALS } from '../../components/CoordinateInput'
import { Map as MapView } from '../../components/Map'
import { NearbyFilters } from '../../components/NearbyFilters'
import { NearbyResults } from '../../components/NearbyResults'
import { usePlaceSearch } from '../../hooks/usePlaceSearch'
import { useProfilePointMarker, useResultTrackLayers, useSearchAreaLayers } from '../../hooks/useNearbyMapLayers'
import { useRouteSelection } from '../../hooks/useRouteSelection'
import { useSearchArea } from '../../hooks/useSearchArea'
import { Sheet } from '../../layout/Sheet'
import { useIsMobile } from '../../layout/useIsMobile'
import { Z_INDEX } from '../../layout/tokens'

export const Route = createFileRoute('/routes/')({
  component: RoutesPage,
})

function RoutesPage() {
  const isMobile = useIsMobile()
  const { t } = useTranslation()
  const [map, setMap] = useState<L.Map | null>(null)
  // Mobile: the search form is a bottom sheet, the results a sheet from the right; one is open at a time
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'createdAt'>('distance')

  const area = useSearchArea(map)
  const place = usePlaceSearch(area.pickLocation)
  const selection = useRouteSelection(map)
  const resetLocateRef = { current: (): void => undefined }

  const {
    data: listResult,
    isLoading: searching,
    error,
    isError,
  } = useListRoutes(
    area.lat != null && area.lng != null ? { lat: area.lat, lng: area.lng, radius: area.radius } : undefined,
    { query: { enabled: area.lat != null && area.lng != null } },
  )
  const results = listResult?.items
  const sortedResults = useMemo(() => {
    if (!results) return results
    switch (sortBy) {
      case 'name':
        return [...results].sort((a, b) => a.name.localeCompare(b.name))
      case 'createdAt':
        return [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      default:
        return results
    }
  }, [results, sortBy])
  const hasResults = sortedResults != null && sortedResults.length > 0

  useSearchAreaLayers(map, area, resetLocateRef.current)
  useResultTrackLayers(map, {
    results,
    selectedDetail: selection.detail,
    highlightedRoute: selection.highlightedRoute,
    onHover: selection.setHovered,
    onToggle: selection.toggle,
  })
  useProfilePointMarker(map, selection.profilePoint)

  const center: [number, number] | undefined = area.lat != null && area.lng != null ? [area.lat, area.lng] : undefined

  const filters = (
    <>
      <NearbyFilters
        place={place}
        area={area}
        searching={searching}
        error={isError ? (error instanceof Error ? error.message : t('nearby.unknownError')) : null}
      />
      <div style={styles.sortRow}>
        <label style={styles.sortLabel}>{t('nearby.sortBy')}:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'distance' | 'name' | 'createdAt')}
          style={styles.select}
        >
          <option value="distance">{t('nearby.nearest')}</option>
          <option value="createdAt">{t('nearby.newest')}</option>
          <option value="name">{t('nearby.nameAZ')}</option>
        </select>
      </div>
    </>
  )

  const heading = (
    <div style={styles.sidebarHeader}>
      <h2 style={styles.heading}>{t('nearby.title')}</h2>
      {isMobile && (
        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          style={styles.closeButton}
          title={t('nearby.close')}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )

  function toggleFilters() {
    setFiltersOpen((open) => !open)
    setResultsOpen(false)
  }

  function toggleResults() {
    setResultsOpen((open) => !open)
    setFiltersOpen(false)
  }

  // The map keeps its position among the container's children in both layouts,
  // so crossing the breakpoint does not recreate the Leaflet map.
  return (
    <div style={styles.container}>
      {!isMobile && (
        <div style={styles.sidebar}>
          {heading}
          {filters}
          {hasResults && (
            <div style={styles.results}>
              <h3 style={styles.resultCount}>{t('nearby.routesFound', { count: sortedResults.length })}</h3>
              <NearbyResults results={sortedResults} selection={selection} />
            </div>
          )}
          <CompareBar from="routes" />
        </div>
      )}

      <div style={styles.mapArea}>
        <MapView
          onMapReady={setMap}
          center={center}
          onLocate={area.pickLocation}
          onResetLocateReady={(reset) => {
            resetLocateRef.current = reset
          }}
        />
        {area.lat != null && area.lng != null && (
          <div style={styles.centerMarker}>
            {area.lat.toFixed(COORDINATE_DECIMALS)}, {area.lng.toFixed(COORDINATE_DECIMALS)}
          </div>
        )}
      </div>

      {isMobile && (
        <>
          <button
            type="button"
            onClick={toggleFilters}
            style={styles.filterButton}
            aria-expanded={filtersOpen}
            aria-label={filtersOpen ? t('nearby.searchClose') : t('nearby.searchOpen')}
          >
            {filtersOpen ? <CloseIcon size={24} /> : <MenuIcon />}
          </button>

          <Sheet side="bottom" open={filtersOpen} onClose={() => setFiltersOpen(false)} label={t('nearby.searchSheet')}>
            <div style={styles.sheetContent}>
              {heading}
              {filters}
            </div>
          </Sheet>

          <Sheet
            side="right"
            open={resultsOpen && hasResults}
            onClose={() => setResultsOpen(false)}
            label={t('nearby.results')}
            style={{ bottom: 20 }}
            handle={
              <button
                type="button"
                onClick={toggleResults}
                disabled={!hasResults}
                aria-expanded={resultsOpen && hasResults}
                aria-label={hasResults ? t('nearby.results') : t('nearby.noRoutes')}
                title={
                  hasResults
                    ? resultsOpen
                      ? t('nearby.close')
                      : `${sortedResults.length} ${t('nearby.routes')}`
                    : t('nearby.noRoutes')
                }
                style={styles.resultsTab}
              >
                <span style={{ color: hasResults ? '#2196f3' : '#ccc' }}>{resultsOpen && hasResults ? '▶' : '◀'}</span>
              </button>
            }
          >
            <div style={styles.resultsHeader}>
              <h3 style={styles.resultsTitle}>{t('nearby.routesFound', { count: sortedResults?.length ?? 0 })}</h3>
              <button
                type="button"
                onClick={() => setResultsOpen(false)}
                style={styles.closeButton}
                title={t('nearby.close')}
              >
                <CloseIcon />
              </button>
            </div>
            <div style={styles.resultsList}>
              <CompareBar from="routes" />
              {sortedResults && <NearbyResults results={sortedResults} selection={selection} />}
            </div>
          </Sheet>
        </>
      )}
    </div>
  )
}

function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1={3} y1={6} x2={21} y2={6} />
      <line x1={3} y1={12} x2={21} y2={12} />
      <line x1={3} y1={18} x2={21} y2={18} />
    </svg>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
    position: 'relative' as const,
  } as const,
  sidebar: {
    width: 360,
    flexShrink: 0,
    overflowY: 'auto',
    borderRight: '1px solid #e0e0e0',
    padding: 16,
    backgroundColor: '#fafafa',
  } as const,
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as const,
  sheetContent: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 16,
  } as const,
  filterButton: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: Z_INDEX.floatingButton,
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
  } as const,
  resultsTab: {
    width: 28,
    height: 100,
    border: 'none',
    borderRadius: '12px 0 0 12px',
    backgroundColor: '#fff',
    boxShadow: '-3px 2px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  } as const,
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0,
  } as const,
  resultsTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
  } as const,
  resultsList: {
    flex: 1,
    overflowY: 'auto',
    padding: 12,
  } as const,
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  } as const,
  mapArea: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  } as const,
  heading: {
    margin: '0 0 16px',
    fontSize: 20,
    fontWeight: 600,
    flex: 1,
  } as const,
  results: {
    marginTop: 16,
  } as const,
  resultCount: {
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    margin: '0 0 8px',
  } as const,
  sortRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  } as const,
  sortLabel: {
    fontSize: 13,
    color: '#666',
    whiteSpace: 'nowrap' as const,
  } as const,
  select: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 13,
    backgroundColor: '#fff',
  } as const,
  centerMarker: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
  } as const,
}
