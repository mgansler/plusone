import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { createQueryClient } from '../lib/query-client'
import { fakeApi, httpError } from '../test/fake-api'
import { careEntry } from '../test/fixtures'

import { UNDO_VISIBLE_MS, UndoProvider, useUndo } from './undo-toast'

function Trigger({ undoable = true }: { undoable?: boolean }) {
  const { confirm, notifyError } = useUndo()
  const entry = careEntry({ id: 7, undoableUntil: undoable ? new Date(Date.now() + 15_000).toISOString() : undefined })
  return (
    <>
      <button onClick={() => confirm('Gefegt eingetragen: Klabuster', entry)}>eintragen</button>
      <button onClick={() => notifyError('Kaputt')}>fehler</button>
    </>
  )
}

function renderToast(undoable?: boolean) {
  const queryClient = createQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <UndoProvider>
        <Trigger undoable={undoable} />
      </UndoProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

describe('UndoProvider', () => {
  afterEach(() => vi.useRealTimers())

  it('offers undo with a countdown and hides it afterwards', () => {
    vi.useFakeTimers()
    renderToast()

    fireEvent.click(screen.getByText('eintragen'))
    expect(screen.getByText('Gefegt eingetragen: Klabuster')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rückgängig' })).toBeTruthy()
    const timer = document.querySelector<HTMLElement>('.toast-timer')
    expect(timer?.style.animationDuration).toBe(`${UNDO_VISIBLE_MS}ms`)

    act(() => vi.advanceTimersByTime(UNDO_VISIBLE_MS - 100))
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeTruthy()

    act(() => vi.advanceTimersByTime(200))
    expect(screen.queryByText('Gefegt eingetragen: Klabuster')).toBeNull()
  })

  it('shows no undo button when the backend does not allow it', () => {
    renderToast(false)
    fireEvent.click(screen.getByText('eintragen'))
    expect(screen.getByText('Gefegt eingetragen: Klabuster')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull()
  })

  it('deletes the entry, refreshes all data and confirms', async () => {
    fakeApi.on('DELETE', '/api/care-entries/7', undefined)
    const queryClient = renderToast()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    fireEvent.click(screen.getByText('eintragen'))
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))

    expect(await screen.findByText('Rückgängig gemacht')).toBeTruthy()
    expect(fakeApi.calls('DELETE', '/api/care-entries/7')).toHaveLength(1)
    expect(invalidate).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull()
  })

  it('reports a failed undo', async () => {
    fakeApi.on('DELETE', '/api/care-entries/7', () => {
      throw httpError(403, 'Der Eintrag kann nicht mehr rückgängig gemacht werden')
    })
    renderToast()

    fireEvent.click(screen.getByText('eintragen'))
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))

    const message = await screen.findByText('Der Eintrag kann nicht mehr rückgängig gemacht werden')
    expect(message.closest<HTMLElement>('.toast')?.dataset.tone).toBe('error')
  })

  it('shows errors and replaces an older toast', () => {
    renderToast()
    fireEvent.click(screen.getByText('eintragen'))
    fireEvent.click(screen.getByText('fehler'))

    expect(screen.getByText('Kaputt')).toBeTruthy()
    expect(screen.queryByText('Gefegt eingetragen: Klabuster')).toBeNull()
  })
})
