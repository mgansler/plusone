import { useTranslation } from 'react-i18next'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { mapPanelBackground, mapPanelClose, mapPanelLabel, mapPanelText } from '../utils/routeColors'

type PointDetailsProps = {
  point: TrackPoint
  /** Defaults to reloading the page */
  onClose?: () => void
}

export function PointDetails({ point, onClose = () => window.location.reload() }: PointDetailsProps) {
  const { t, i18n } = useTranslation()
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>{t('pointDetails.title')}</span>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>
      <div style={styles.grid}>
        <Stat label={t('pointDetails.elevation')} value={`${point.elevation} m`} />
        {point.hr !== undefined && <Stat label={t('pointDetails.hr')} value={`${point.hr} bpm`} />}
        {point.cad !== undefined && <Stat label={t('pointDetails.cadence')} value={`${point.cad} rpm`} />}
        <Stat
          label={t('pointDetails.time')}
          value={point.time.toLocaleTimeString(i18n.language, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        />
        <Stat label={t('pointDetails.date')} value={point.time.toLocaleDateString(i18n.language)} />
      </div>
    </div>
  )
}

type StatProps = {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div style={styles.stat}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  )
}

const styles = {
  panel: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: mapPanelBackground,
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '180px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: mapPanelText,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: mapPanelClose,
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 0.25rem',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: '0.8rem',
    color: mapPanelLabel,
  },
  value: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: mapPanelText,
  },
} as const
