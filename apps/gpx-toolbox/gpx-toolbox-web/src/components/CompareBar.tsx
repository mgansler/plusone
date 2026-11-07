import { Link } from '@tanstack/react-router'

import { useCompareList } from '../hooks/useCompareList'
import { routeColor } from '../utils/routeColors'

/** Comparison list at the bottom of a sidebar; hidden while it is empty */
export function CompareBar({ from }: { from?: string } = {}) {
  const { items, remove, clear } = useCompareList()
  if (items.length === 0) return null

  const canCompare = items.length >= 2

  return (
    <div style={styles.bar} aria-label="Vergleichsliste">
      <div style={styles.header}>
        <span style={styles.title}>Vergleich ({items.length})</span>
        <button type="button" onClick={clear} style={styles.clearButton}>
          Leeren
        </button>
      </div>
      <ul style={styles.list}>
        {items.map((item, index) => (
          <li key={item.id} style={styles.item}>
            <span style={{ ...styles.swatch, backgroundColor: routeColor(index) }} />
            <span style={styles.name}>{item.name}</span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              style={styles.removeButton}
              aria-label={`${item.name} aus dem Vergleich entfernen`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {canCompare ? (
        <Link to="/compare" search={from ? { from } : undefined} style={styles.compareButton}>
          Vergleichen →
        </Link>
      ) : (
        <div style={styles.hint}>Mindestens eine weitere Route hinzufügen</div>
      )}
    </div>
  )
}

const styles = {
  bar: {
    // Stays visible at the bottom of the scrolling sidebar
    position: 'sticky',
    bottom: 0,
    margin: '0 0 16px',
    padding: 12,
    backgroundColor: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
  } as const,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as const,
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  clearButton: {
    padding: 0,
    fontSize: 12,
    border: 'none',
    background: 'none',
    color: '#64748b',
    cursor: 'pointer',
  } as const,
  list: {
    listStyle: 'none',
    margin: '0 0 10px',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } as const,
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  } as const,
  swatch: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  } as const,
  name: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#334155',
  } as const,
  removeButton: {
    padding: '0 4px',
    fontSize: 16,
    lineHeight: 1,
    border: 'none',
    background: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  } as const,
  compareButton: {
    display: 'block',
    padding: '8px 12px',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#2563eb',
    borderRadius: 6,
  } as const,
  hint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  } as const,
}
