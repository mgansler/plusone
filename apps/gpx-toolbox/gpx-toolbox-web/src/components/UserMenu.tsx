import { useEffect, useRef, useState } from 'react'

import { StravaProfile } from './StravaProfile'

/**
 * User name in the topbar; a click opens the Strava profile card as a popover.
 * The profile is only fetched while the popover is open (Strava rate limit).
 */
export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside and on Escape
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} style={styles.container}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={styles.nameButton}
      >
        {name} ▾
      </button>
      {open && (
        <div role="dialog" aria-label="Strava Profil" style={styles.popover}>
          <StravaProfile />
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
  },
  nameButton: {
    fontSize: 13,
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    padding: '4px 6px',
    borderRadius: 4,
    cursor: 'pointer',
  },
  popover: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: 320,
    padding: '1rem',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    // Above Leaflet panes and controls
    zIndex: 2000,
  },
} as const
