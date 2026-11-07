import { useState } from 'react'

import { TOPBAR_HEIGHT, Z_INDEX } from '../layout/tokens'
import { useIsMobile } from '../layout/useIsMobile'

const NAV_ITEMS = [
  { href: '/nearby', label: 'In der Nähe' },
  { href: '/routes', label: 'Routen' },
  { href: '/activities', label: 'Aktivitäten' },
  { href: '/utils', label: 'Utils' },
  { href: '/settings', label: 'Einstellungen' },
] as const

type TopBarProps = {
  userName?: string | null
  onLogout: () => void
}

/** App bar with the main navigation: a row of links on desktop, a dropdown menu on mobile */
export function TopBar({ userName, onLogout }: TopBarProps) {
  const isMobile = useIsMobile()

  return (
    <div style={styles.topbar}>
      <a href="/" style={styles.brand}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: 6 }}
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        GPX-Toolcat
      </a>
      {isMobile ? (
        <MobileMenu userName={userName} onLogout={onLogout} />
      ) : (
        <nav aria-label="Hauptnavigation" style={styles.links}>
          {userName && <span style={styles.user}>{userName}</span>}
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} style={styles.link}>
              {item.label}
            </a>
          ))}
          <button onClick={onLogout} style={styles.logoutButton}>
            Abmelden
          </button>
        </nav>
      )}
    </div>
  )
}

function MobileMenu({ userName, onLogout }: TopBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={styles.menuButton} aria-label="Menü" aria-expanded={open}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <nav aria-label="Hauptnavigation" style={styles.dropdown}>
          {userName && <div style={styles.dropdownUser}>{userName}</div>}
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} style={styles.dropdownLink}>
              {item.label}
            </a>
          ))}
          <div style={styles.dropdownDivider} />
          <button
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            style={styles.dropdownLogout}
          >
            Abmelden
          </button>
        </nav>
      )}
    </div>
  )
}

const styles = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderBottom: '1px solid #334155',
    height: TOPBAR_HEIGHT,
    flexShrink: 0,
  } as const,
  brand: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f8fafc',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  } as const,
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } as const,
  link: {
    fontSize: 13,
    color: '#60a5fa',
    textDecoration: 'none',
  } as const,
  user: {
    fontSize: 13,
    color: '#94a3b8',
  } as const,
  logoutButton: {
    fontSize: 13,
    color: '#f87171',
    background: 'none',
    border: '1px solid #f87171',
    borderRadius: 4,
    padding: '2px 10px',
    cursor: 'pointer',
  } as const,
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    color: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  } as const,
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    minWidth: 180,
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    zIndex: Z_INDEX.dropdown,
  } as const,
  dropdownLink: {
    display: 'block',
    padding: '10px 16px',
    fontSize: 13,
    color: '#60a5fa',
    textDecoration: 'none',
    borderBottom: '1px solid #334155',
  } as const,
  dropdownUser: {
    display: 'block',
    padding: '10px 16px',
    fontSize: 13,
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
  } as const,
  dropdownDivider: {
    height: 1,
    backgroundColor: '#334155',
  } as const,
  dropdownLogout: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    fontSize: 13,
    color: '#f87171',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  } as const,
}
