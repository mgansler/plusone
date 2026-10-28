import type { ReactNode } from 'react'

type SidebarLayoutProps = {
  /** Content of the header bar at the top (e.g. app title or back link) */
  header: ReactNode
  children?: ReactNode
}

/**
 * Dark sidebar shell shared by all map pages: fixed width, header bar and a scrollable content column.
 */
export function SidebarLayout({ header, children }: SidebarLayoutProps) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>{header}</div>
      <div style={styles.content}>{children}</div>
    </div>
  )
}

export function SidebarDivider() {
  return <div style={styles.divider} />
}

const styles = {
  sidebar: {
    width: '400px',
    flexShrink: 0,
    height: '100%',
    background: '#1e293b',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRight: '1px solid #334155',
    overflow: 'auto',
  },
  header: {
    padding: '1.25rem 1rem 0.75rem',
    borderBottom: '1px solid #334155',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1rem',
    gap: '1rem',
    overflow: 'auto',
  },
  divider: {
    height: '1px',
    flexShrink: 0,
    background: '#334155',
  },
} as const
