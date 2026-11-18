import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type L from 'leaflet'

import { useCompareList } from '../hooks/useCompareList'
import { useCombineState } from '../hooks/useCombineState'
import { Map as MapView } from '../components/Map'
import { CompareElevationProfile, type ProfileHover, type ProfileTrack } from '../components/CompareElevationProfile'
import { SidebarDivider, SidebarLayout } from '../components/SidebarLayout'
import { SegmentPicker } from '../components/SegmentPicker'
import { CombineSegmentList } from '../components/CombineSegmentList'
import { CombineGapFillList } from '../components/CombineGapFillList'
import { CombinePreviewMap } from '../components/CombinePreviewMap'
import { Sheet } from '../layout/Sheet'
import { TOPBAR_HEIGHT } from '../layout/tokens'
import { useIsMobile } from '../layout/useIsMobile'
import { routeStyle } from '../utils/routeColors'

export const Route = createFileRoute('/combine')({
  component: CombinePage,
})

function CombinePage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const mapRef = useRef<L.Map | null>(null)
  const compareList = useCompareList()

  const { sourceRoutes, initSourceRouteIds, orderedSegments, getCombinedRoutePoints } = useCombineState()
  const [hover, setHover] = useState<ProfileHover | null>(null)

  // Source routes as ProfileTracks for the elevation profile
  const profileTracks: Array<ProfileTrack> = useMemo(() => {
    let index = 0
    const tracks: Array<ProfileTrack> = Array.from(sourceRoutes.entries())
      .filter(([, source]) => source.points.length >= 2 && source.points.every((p) => Number.isFinite(p.elevation)))
      .map(([routeId, source]) => {
        const style = routeStyle(index++)
        return {
          id: routeId,
          name: source.route.name,
          color: style.color,
          dashArray: style.dashArray,
          points: source.points,
        }
      })

    // Add combined route as an additional track (only when segments are selected)
    if (orderedSegments.length > 0) {
      const combinedPoints = getCombinedRoutePoints()
      if (combinedPoints.length >= 2 && combinedPoints.every((p) => Number.isFinite(p.elevation))) {
        tracks.push({
          id: 'combined-route',
          name: t('combine.combinedRouteName'),
          color: '#22c55e',
          points: combinedPoints,
        })
      }
    }

    return tracks
  }, [sourceRoutes, orderedSegments, getCombinedRoutePoints, t])

  // Pre-select routes from the compare list (localStorage via useCompareList)
  useEffect(() => {
    const ids = compareList.items.map((item) => item.id)
    if (ids.length >= 2) {
      initSourceRouteIds(ids)
    }
  }, [compareList.items, initSourceRouteIds])

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      {isMobile ? (
        <Sheet side="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} label={t('combine.title')}>
          <CombineSidebarContent />
        </Sheet>
      ) : (
        <SidebarLayout header={<CombineHeader />}>
          <CombineSidebarContent />
        </SidebarLayout>
      )}

      {/* Map & Profile area */}
      <div style={styles.mapContainer}>
        {isMobile && (
          <button onClick={() => setSidebarOpen(true)} style={styles.mobileMenuButton} title={t('combine.openSidebar')}>
            ☰
          </button>
        )}

        {/* Map */}
        <div style={styles.mapWrapper}>
          <MapView mapRef={mapRef}>
            {mapRef.current && <CombinePreviewMap mapInstance={mapRef.current} hover={hover} />}
          </MapView>
        </div>

        {/* Elevation profiles */}
        <div style={styles.profileContainer}>
          <CompareElevationProfile tracks={profileTracks} onHover={setHover} />
        </div>
      </div>
    </div>
  )
}

function CombineHeader() {
  const { t } = useTranslation()

  return (
    <div style={styles.header}>
      <Link to="/routes" style={styles.backLink}>
        {t('combine.back')}
      </Link>
      <h2 style={styles.headerTitle}>{t('combine.title')}</h2>
    </div>
  )
}

function CombineSidebarContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sourceRoutes, orderedSegments, combining, combineError, combineRoutes, totalDistance } = useCombineState()
  const [routeName, setRouteName] = useState('')

  const handleCombine = useCallback(async () => {
    if (orderedSegments.length === 0) return
    const name = routeName.trim() || t('combine.defaultName')
    const newRouteId = await combineRoutes(name)
    if (newRouteId) {
      void navigate({ to: '/routes/$routeId', params: { routeId: newRouteId } })
    }
  }, [orderedSegments, routeName, combineRoutes, navigate, t])

  return (
    <>
      <div style={styles.sectionTitle}>{t('combine.segments')}</div>
      {sourceRoutes.size === 0 ? (
        <div style={styles.hint}>{t('combine.selectSourcesHint')}</div>
      ) : (
        Array.from(sourceRoutes.entries()).map(([routeId, source]) => (
          <SegmentPicker key={routeId} routeId={routeId} routeName={source.route.name} segments={source.segments} />
        ))
      )}

      <SidebarDivider />

      <CombineSegmentList />

      <CombineGapFillList />

      <SidebarDivider />

      {/* Combine */}
      <div style={styles.combineSection}>
        {orderedSegments.length > 0 && (
          <div style={styles.distanceLabel}>
            {t('combine.totalDistance')}: {(totalDistance / 1000).toFixed(1)} km
          </div>
        )}
        <div style={styles.combineActions}>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            style={styles.nameInput}
            placeholder={t('combine.routeNamePlaceholder')}
          />
          <button
            onClick={handleCombine}
            disabled={orderedSegments.length === 0 || combining}
            style={{
              ...styles.combineButton,
              opacity: orderedSegments.length === 0 || combining ? 0.5 : 1,
            }}
          >
            {combining ? t('combine.combining') : t('combine.combine')}
          </button>
        </div>
        {combineError && <div style={styles.error}>{combineError}</div>}
      </div>
    </>
  )
}

const styles = {
  page: {
    display: 'flex',
    height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
    width: '100%',
    overflow: 'hidden',
  } as const,
  mapContainer: {
    flex: 1,
    position: 'relative' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    minHeight: 0,
  } as const,
  mapWrapper: {
    flex: 1,
    minHeight: 0,
  } as const,
  profileContainer: {
    height: 180,
    borderTop: '1px solid #334155',
    backgroundColor: '#1e293b',
    flexShrink: 0,
  } as const,
  mobileMenuButton: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    zIndex: 1000,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 4,
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: 20,
    cursor: 'pointer',
  } as const,
  combineBar: {
    position: 'absolute' as const,
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderRadius: 8,
    padding: '12px 16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  } as const,
  combineInfo: {
    marginBottom: 8,
  } as const,
  distanceLabel: {
    fontSize: 13,
    color: '#94a3b8',
  } as const,
  combineActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  } as const,
  nameInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #475569',
    borderRadius: 4,
    backgroundColor: '#334155',
    color: '#e2e8f0',
    outline: 'none',
  } as const,
  combineButton: {
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 600,
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  } as const,
  error: {
    marginTop: 8,
    fontSize: 13,
    color: '#ef4444',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } as const,
  backLink: {
    fontSize: 13,
    color: '#94a3b8',
    textDecoration: 'none',
  } as const,
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
    color: '#e2e8f0',
  } as const,
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 8,
  } as const,
  hint: {
    padding: 16,
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: 13,
  } as const,
  combineSection: {
    paddingTop: 8,
  } as const,
}
