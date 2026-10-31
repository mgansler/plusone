import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './ConfirmDialog'

function renderDialog(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmDialog
      title="Route löschen"
      message="Wird endgültig gelöscht."
      confirmLabel="Löschen"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('shows title and message and confirms via the confirm button', () => {
    const { onConfirm, onCancel } = renderDialog()

    expect(screen.getByRole('dialog', { name: 'Route löschen' })).toBeTruthy()
    expect(screen.getByText('Wird endgültig gelöscht.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Löschen' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('cancels via the cancel button, Escape and the backdrop', () => {
    const { onCancel, onConfirm } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement)

    expect(onCancel).toHaveBeenCalledTimes(3)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('disables the buttons and ignores Escape while pending', () => {
    const { onCancel } = renderDialog({ pending: true })

    expect((screen.getByRole('button', { name: 'Löschen…' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Abbrechen' }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('shows an error', () => {
    renderDialog({ error: 'Route konnte nicht gelöscht werden.' })

    expect(screen.getByText('Route konnte nicht gelöscht werden.')).toBeTruthy()
  })
})
