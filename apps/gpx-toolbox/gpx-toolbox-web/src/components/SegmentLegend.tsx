import { useTranslation } from 'react-i18next'

/**
 * Small legend showing the color coding for segment types on the map.
 */
export function SegmentLegend() {
  const { t } = useTranslation()

  const items = [
    { type: 'uphill' as const, color: '#22c55e', label: t('segmentBreakdown.uphill') },
    { type: 'downhill' as const, color: '#f97316', label: t('segmentBreakdown.downhill') },
    { type: 'flat' as const, color: '#60a5fa', label: t('segmentBreakdown.flat') },
  ]

  return (
    <div style={styles.container}>
      {items.map((item) => (
        <div key={item.type} style={styles.row}>
          <span style={{ ...styles.swatch, backgroundColor: item.color }} />
          <span style={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: '6px',
    padding: '6px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  swatch: {
    width: '12px',
    height: '3px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  label: {
    fontSize: '11px',
    color: '#cbd5e1',
    whiteSpace: 'nowrap' as const,
  },
} as const
