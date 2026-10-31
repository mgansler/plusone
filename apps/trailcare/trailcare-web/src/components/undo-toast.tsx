import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import type { CareEntryDto } from '@plusone/trailcare-api-client'
import { deleteCareEntry } from '@plusone/trailcare-api-client'

import { errorMessage } from '../lib/api-error'

/** Shorter than the backend's undo window so a late tap still succeeds */
export const UNDO_VISIBLE_MS = 10_000

type Toast = { id: number; message: string; entry?: CareEntryDto; tone: 'done' | 'error' | 'undone' }

type UndoContextValue = {
  /** Show a confirmation, with an undo button if the backend allows undoing the entry */
  confirm: (message: string, entry: CareEntryDto) => void
  notifyError: (message: string) => void
}

const UndoContext = createContext<UndoContextValue>({ confirm: () => undefined, notifyError: () => undefined })

export function useUndo() {
  return useContext(UndoContext)
}

export function UndoProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<Toast | null>(null)
  const [isUndoing, setIsUndoing] = useState(false)
  const nextId = useRef(0)

  const show = useCallback((next: Omit<Toast, 'id'>) => setToast({ ...next, id: ++nextId.current }), [])

  const confirm = useCallback(
    (message: string, entry: CareEntryDto) =>
      show({ message, entry: entry.undoableUntil ? entry : undefined, tone: 'done' }),
    [show],
  )
  const notifyError = useCallback((message: string) => show({ message, tone: 'error' }), [show])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(
      () => setToast((current) => (current?.id === toast.id ? null : current)),
      toast.entry ? UNDO_VISIBLE_MS : 4_000,
    )
    return () => window.clearTimeout(timeout)
  }, [toast])

  const undo = async () => {
    if (!toast?.entry) return
    setIsUndoing(true)
    try {
      await deleteCareEntry(toast.entry.id)
      await queryClient.invalidateQueries()
      show({ message: 'Rückgängig gemacht', tone: 'undone' })
    } catch (error) {
      show({ message: errorMessage(error, 'Rückgängig machen ging nicht mehr.'), tone: 'error' })
    } finally {
      setIsUndoing(false)
    }
  }

  return (
    <UndoContext.Provider value={{ confirm, notifyError }}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div className="toast" data-tone={toast.tone} key={toast.id}>
            <span className="toast-message">{toast.message}</span>
            {toast.entry && (
              <button className="toast-undo" onClick={undo} disabled={isUndoing}>
                Rückgängig
              </button>
            )}
            {toast.entry && (
              <span className="toast-timer" style={{ animationDuration: `${UNDO_VISIBLE_MS}ms` }} aria-hidden="true" />
            )}
          </div>
        )}
      </div>
    </UndoContext.Provider>
  )
}
