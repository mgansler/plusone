import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { formatElevation } from '../utils/format'
import { routeSourceColor, routeStatusColor, routeStatusLabel } from '../utils/routeStatus'
import { shareGpx } from '../utils/share'

import { CompareToggleButton } from './CompareToggleButton'

type RouteResultCardProps = {
  route: {
    id: string
    name: string
    distanceKm: string
    source: string
    status: string
    stats?: { [key: string]: unknown }
  }
  /** Color of the route's track on the map, shown as stripe at the card's edge */
  color: string
  selected: boolean
  hovered: boolean
  onSelect: () => void
  onHoverChange: (hovered: boolean) => void
  /** Details below the card, shown while the card is selected (e.g. the elevation profile) */
  children?: ReactNode
}

/** Entry of a route search result list; takes the width it is given */
export function RouteResultCard({
  route,
  color,
  selected,
  hovered,
  onSelect,
  onHoverChange,
  children,
}: RouteResultCardProps) {
  const { t } = useTranslation()
  const stats = route.stats as { distance?: number; elevationGain?: number; elevationLoss?: number } | undefined
  const formatElev = (value: number | undefined) => (value != null ? formatElevation(value) : '-')

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      style={{
        ...styles.card,
        boxShadow: `inset 6px 0 0 ${color}`,
        backgroundColor: selected ? '#e3f2fd' : hovered ? '#f5f5f5' : '#fff',
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void shareGpx(route.id, route.name)
        }}
        style={styles.shareButton}
        title={t('routes.shareGpx')}
      >
        📤
      </button>
      <div style={styles.name}>{route.name}</div>
      <div style={styles.distance}>{route.distanceKm} km</div>
      <div style={styles.meta}>
        <span style={{ ...styles.badge, backgroundColor: routeSourceColor(route.source) }}>{route.source}</span>
        <span style={{ ...styles.badge, backgroundColor: routeStatusColor(route.status) }}>
          {routeStatusLabel(route.status)}
        </span>
        <span style={styles.compareToggle}>
          <CompareToggleButton id={route.id} name={route.name} />
        </span>
      </div>
      {selected && stats && (
        <div style={styles.stats}>
          <div>
            {t('routes.strecke')}: {stats.distance ? `${(stats.distance / 1000).toFixed(1)} km` : '-'}
          </div>
          <div>
            {t('routes.elevationGain')}: {formatElev(stats.elevationGain)}
          </div>
          <div>
            {t('routes.elevationLoss')}: {formatElev(stats.elevationLoss)}
          </div>
        </div>
      )}
      {selected && children != null && (
        <div style={styles.details} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    position: 'relative',
    padding: '12px 12px 12px 18px',
    marginBottom: 8,
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.15s',
  } as const,
  name: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 4,
  } as const,
  distance: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2196f3',
    marginBottom: 4,
  } as const,
  meta: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  } as const,
  compareToggle: {
    marginLeft: 'auto',
  } as const,
  shareButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: '2px 4px',
    lineHeight: 1,
  } as const,
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    color: '#fff',
    fontWeight: 500,
    marginRight: 4,
  } as const,
  stats: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
    borderTop: '1px solid #e0e0e0',
    paddingTop: 8,
  } as const,
  details: {
    marginTop: 8,
    cursor: 'default',
  } as const,
}
