import { type ReactNode, useEffect, useId } from 'react'

type ModalProps = {
  title: string
  children: ReactNode
  /** Called on a click on the backdrop and on Escape */
  onClose: () => void
  maxWidth?: number
}

/** Centered dialog on a dimmed backdrop; base for all modals of the app */
export function Modal({ title, children, onClose, maxWidth = 400 }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ ...modalStyles.modal, maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} style={modalStyles.heading}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

/** Shared styles for the content of modals (text, action row, buttons) */
export const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Above Leaflet's panes and controls
    zIndex: 1000,
  } as const,
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  } as const,
  heading: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  message: {
    margin: '0 0 20px',
    fontSize: 14,
    lineHeight: 1.5,
    color: '#475569',
  } as const,
  actions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  } as const,
  cancelButton: {
    padding: '8px 16px',
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    color: '#475569',
    cursor: 'pointer',
  } as const,
  submitButton: {
    padding: '8px 16px',
    fontSize: 14,
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  } as const,
  dangerButton: {
    padding: '8px 16px',
    fontSize: 14,
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#dc2626',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  } as const,
  error: {
    margin: '0 0 12px',
    padding: '6px 10px',
    fontSize: 13,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  } as const,
}
