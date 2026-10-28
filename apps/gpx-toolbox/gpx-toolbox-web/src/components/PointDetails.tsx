import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

type PointDetailsProps = {
  point: TrackPoint
  /** Defaults to reloading the page */
  onClose?: () => void
}

export function PointDetails({ point, onClose = () => window.location.reload() }: PointDetailsProps) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>Track-Punkt</span>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>
      <div style={styles.grid}>
        <Stat label="Höhe" value={`${point.elevation} m`} />
        {point.hr !== undefined && <Stat label="HR" value={`${point.hr} bpm`} />}
        {point.cad !== undefined && <Stat label="Cadence" value={`${point.cad} rpm`} />}
        <Stat
          label="Zeit"
          value={point.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        />
        <Stat label="Datum" value={point.time.toLocaleDateString('de-DE')} />
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
    background: '#fff',
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
    color: '#1a1a1a',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#999',
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
    color: '#666',
  },
  value: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
} as const
