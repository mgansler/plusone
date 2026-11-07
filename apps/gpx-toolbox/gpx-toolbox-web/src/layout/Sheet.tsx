import { type CSSProperties, type ReactNode, useEffect } from 'react'

import { TOPBAR_HEIGHT, Z_INDEX } from './tokens'

const SLIDE_MS = 250

type SheetProps = {
  /** Edge of the viewport the sheet slides in from */
  side: 'top' | 'bottom' | 'right'
  open: boolean
  onClose: () => void
  /** Accessible name of the sheet */
  label: string
  /** Control attached to the sheet's edge that moves with it, e.g. a tab that toggles the sheet */
  handle?: ReactNode
  /** Dims the page behind the sheet and closes it on a click there; without, the page stays usable */
  backdrop?: boolean
  /** Overrides for the panel's position and size */
  style?: CSSProperties
  /** Overrides for the surface inside the panel, e.g. its colors and padding */
  bodyStyle?: CSSProperties
  children: ReactNode
}

/**
 * Panel that slides in over the page from a viewport edge, with a backdrop that closes it.
 * Its content stays mounted while closed, just off-screen and inert: hidden from the accessibility tree and
 * the tab order. Opening only moves the panel and fades the backdrop; the panel itself is never switched between
 * `visibility: hidden` and `visible`, which would have to be timed against the slide.
 */
export function Sheet({ side, open, onClose, label, handle, backdrop = true, style, bodyStyle, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {backdrop && (
        <div style={{ ...styles.backdrop, ...(open ? styles.backdropOpen : undefined) }} onClick={onClose} />
      )}
      <div style={{ ...styles.panel, ...panelStyles[side], ...(open ? undefined : closedStyles[side]), ...style }}>
        {handle != null && <div style={handleStyles[side]}>{handle}</div>}
        <div
          role="dialog"
          aria-label={label}
          aria-hidden={!open}
          inert={!open}
          style={{ ...styles.body, ...bodyStyles[side], ...bodyStyle }}
        >
          {children}
        </div>
      </div>
    </>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: Z_INDEX.sheetBackdrop,
    opacity: 0,
    pointerEvents: 'none',
    transition: `opacity ${SLIDE_MS}ms ease`,
  } as const,
  backdropOpen: {
    opacity: 1,
    pointerEvents: 'auto',
  } as const,
  panel: {
    position: 'fixed',
    zIndex: Z_INDEX.sheet,
    transition: `transform ${SLIDE_MS}ms ease`,
  } as const,
  body: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  } as const,
}

const panelStyles = {
  top: { left: 0, right: 0, top: TOPBAR_HEIGHT, height: '30vh' },
  bottom: { left: 0, right: 0, bottom: 0, height: '60vh' },
  right: { top: TOPBAR_HEIGHT, right: 0, bottom: 0, width: 320, maxWidth: '85vw' },
} satisfies Record<SheetProps['side'], CSSProperties>

const closedStyles = {
  top: { transform: 'translateY(-100%)' },
  bottom: { transform: 'translateY(100%)' },
  right: { transform: 'translateX(100%)' },
} satisfies Record<SheetProps['side'], CSSProperties>

const bodyStyles = {
  top: { borderRadius: '0 0 12px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' },
  bottom: { borderRadius: '12px 12px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' },
  right: { borderRadius: '12px 0 0 12px', boxShadow: '-4px 0 20px rgba(0,0,0,0.2)' },
} satisfies Record<SheetProps['side'], CSSProperties>

const handleStyles = {
  top: { position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)' },
  bottom: { position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
  right: { position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)' },
} satisfies Record<SheetProps['side'], CSSProperties>
