import { useTranslation } from 'react-i18next'

import { useCombineState } from '../hooks/useCombineState'

// Color for GapFills (neutral, different from segment type colors)
const gapFillColor = '#8b5cf6'

// Color for via points
const viaPointColor = '#f59e0b'

export function CombineGapFillList() {
  const { t } = useTranslation()
  const {
    gapFills,
    orderedSegments,
    computeGapFillRoute,
    addGapFillViaPoint,
    removeGapFillViaPoint,
    setHoveredGapFillId,
  } = useCombineState()

  if (gapFills.length === 0) {
    return null
  }

  // Find the route name of a segment by its ID
  const getSegmentName = (segmentId: string) => {
    const segment = orderedSegments.find((s) => s.id === segmentId)
    return segment?.routeName ?? t('combine.unknownSegment')
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h3 style={styles.title}>{t('combine.gapFills')}</h3>
        <span style={styles.badge}>{gapFills.length}</span>
      </div>

      <div style={styles.list}>
        {gapFills.map((fill, index) => {
          const distanceKm = (fill.distance ?? 0) / 1000
          const hasRoute = fill.routePoints != null && fill.routePoints.length > 0
          const hasError = fill.error != null
          const gapLetter = String.fromCharCode(65 + index)

          return (
            <div
              key={fill.id}
              style={styles.item}
              onMouseEnter={() => setHoveredGapFillId(fill.id)}
              onMouseLeave={() => setHoveredGapFillId(null)}
            >
              <div style={styles.gapLetter}>{gapLetter}</div>

              <div
                style={{
                  ...styles.typeIndicator,
                  backgroundColor: hasError ? '#e53935' : hasRoute ? '#43a047' : gapFillColor,
                }}
              />

              <div style={styles.itemContent}>
                <div style={styles.itemName}>
                  {getSegmentName(fill.prevSegmentId)} → {getSegmentName(fill.nextSegmentId)}
                </div>
                <div style={styles.itemMeta}>
                  <span>
                    {distanceKm.toFixed(2)} km {t('combine.straightLine')}
                  </span>
                  {hasRoute && <span style={styles.routeBadge}>{t('combine.routeComputed')}</span>}
                  {fill.loading && <span style={styles.loadingBadge}>{t('combine.computing')}</span>}
                  {hasError && <span style={styles.errorBadge}>{fill.error}</span>}
                </div>
              </div>

              <div style={styles.actions}>
                {/* Via points display */}
                {fill.viaPoints.length > 0 && (
                  <span style={styles.viaBadge} title={`${fill.viaPoints.length} ${t('combine.viaPoints')}`}>
                    ⋮ {fill.viaPoints.length}
                  </span>
                )}
                {/* Add via point - sets first point in the middle of the gap */}
                <button
                  onClick={() => {
                    // Set a via point in the middle of the gap
                    const midLat = (fill.from.latitude + fill.to.latitude) / 2
                    const midLng = (fill.from.longitude + fill.to.longitude) / 2
                    addGapFillViaPoint(fill.id, {
                      latitude: midLat,
                      longitude: midLng,
                      elevation: 0,
                      time: new Date(),
                    })
                  }}
                  style={styles.viaButton}
                  title={t('combine.addViaPoint')}
                >
                  +
                </button>
                {/* Remove via point (the last one) */}
                {fill.viaPoints.length > 0 && (
                  <button
                    onClick={() => removeGapFillViaPoint(fill.id, fill.viaPoints.length - 1)}
                    style={styles.viaRemoveButton}
                    title={t('combine.removeLastViaPoint')}
                  >
                    −
                  </button>
                )}
                {!hasRoute && !fill.loading && (
                  <button
                    onClick={() => computeGapFillRoute(fill.id)}
                    style={styles.computeButton}
                    title={t('combine.computeRoute')}
                  >
                    {t('combine.route')}
                  </button>
                )}
                {fill.loading && (
                  <button disabled style={styles.computeButton}>
                    …
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  section: {
    marginBottom: 16,
  } as const,
  header: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  } as const,
  title: {
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
    color: '#333',
  } as const,
  badge: {
    fontSize: 11,
    padding: '2px 6px',
    backgroundColor: '#ede9fe',
    color: '#7c3aed',
    borderRadius: 4,
  } as const,
  list: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 4,
    maxHeight: 200,
    overflowY: 'auto',
  } as const,
  item: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    backgroundColor: '#fafafa',
    borderRadius: 4,
    border: '1px solid #e0e0e0',
  } as const,
  gapLetter: {
    width: 22,
    height: 22,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gapFillColor,
    color: '#fff',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'sans-serif',
    flexShrink: 0,
  } as const,
  typeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    flexShrink: 0,
  } as const,
  itemContent: {
    flex: 1,
    minWidth: 0,
  } as const,
  itemName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as const,
  itemMeta: {
    fontSize: 11,
    color: '#888',
    display: 'flex' as const,
    gap: 6,
    marginTop: 2,
    alignItems: 'center',
  } as const,
  routeBadge: {
    fontSize: 10,
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 500,
    backgroundColor: '#43a047' + '20',
    color: '#43a047',
  } as const,
  loadingBadge: {
    fontSize: 10,
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 500,
    backgroundColor: '#8b5cf6' + '20',
    color: '#8b5cf6',
  } as const,
  errorBadge: {
    fontSize: 10,
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 500,
    backgroundColor: '#e53935' + '20',
    color: '#e53935',
  } as const,
  actions: {
    display: 'flex' as const,
    gap: 2,
    flexShrink: 0,
  } as const,
  computeButton: {
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: gapFillColor,
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  } as const,
  viaBadge: {
    fontSize: 10,
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 500,
    backgroundColor: viaPointColor + '20',
    color: viaPointColor,
  } as const,
  viaButton: {
    width: 22,
    height: 22,
    fontSize: 14,
    fontWeight: 700,
    backgroundColor: viaPointColor,
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: 0,
  } as const,
  viaRemoveButton: {
    width: 22,
    height: 22,
    fontSize: 14,
    fontWeight: 700,
    backgroundColor: '#94a3b8',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: 0,
  } as const,
}
