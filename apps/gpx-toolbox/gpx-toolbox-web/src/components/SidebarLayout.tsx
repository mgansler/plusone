import type { ReactNode } from 'react'

import { useIsMobile } from '../layout/useIsMobile'

type SidebarLayoutProps = {
  /** Content of the header bar at the top (e.g. a back link); omitted pages start directly with the content */
  header?: ReactNode
  children?: ReactNode
}

/**
 * Dark sidebar shell shared by all map pages: header bar and a scrollable content column.
 * Fixed width next to the map on desktop, the full width on mobile.
 */
export function SidebarLayout({ header, children }: SidebarLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <div style={isMobile ? { ...styles.sidebar, ...styles.sidebarMobile } : styles.sidebar}>
      {header != null && <div style={styles.header}>{header}</div>}
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
  sidebarMobile: {
    width: '100%',
    borderRight: 'none',
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
