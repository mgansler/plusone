import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { UploadGpxModal } from './UploadGpxModal'

function renderModal(props: Partial<Parameters<typeof UploadGpxModal>[0]> = {}) {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const onClose = vi.fn()
  const upload = vi.fn().mockResolvedValue(undefined)
  const result = render(
    <QueryClientProvider client={queryClient}>
      <UploadGpxModal
        heading="Aktivität hochladen"
        upload={upload}
        namePlaceholder="Titel"
        invalidateQueryKeys={[['activities'], ['routes']]}
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  )
  return { ...result, invalidateQueries, onClose, upload }
}

function selectFile(container: HTMLElement, name: string) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [new File(['<gpx></gpx>'], name)] } })
}

const submitButton = () => screen.getByRole('button', { name: 'Hochladen' }) as HTMLButtonElement

describe('UploadGpxModal', () => {
  it('hands the file and the trimmed name to the upload and refetches the given queries', async () => {
    const { container, invalidateQueries, onClose, upload } = renderModal()

    selectFile(container, 'ride.gpx')
    fireEvent.change(screen.getByPlaceholderText('Titel'), { target: { value: ' Feierabendrunde ' } })
    fireEvent.click(submitButton())

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(upload).toHaveBeenCalledTimes(1)
    const [file, name] = upload.mock.calls[0]
    expect((file as File).name).toBe('ride.gpx')
    expect(name).toBe('Feierabendrunde')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activities'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['routes'] })
  })

  it('tells before the upload that heart rate values are stored and links the privacy policy', () => {
    renderModal()

    expect(screen.getByText(/Enthält die Datei Herzfrequenzwerte, werden sie gespeichert/)).toBeTruthy()
    expect(screen.getByText(/willigst du in die Speicherung ein/)).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Datenschutzerklärung' })
    expect(link.getAttribute('href')).toBe('/datenschutz')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('passes no name for an empty optional name', async () => {
    const { container, onClose, upload } = renderModal({ nameRequired: false })

    selectFile(container, 'ride.gpx')
    expect(submitButton().disabled).toBe(false)
    fireEvent.click(submitButton())

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(upload.mock.calls[0][1]).toBeUndefined()
  })

  it('stays open when the upload fails', async () => {
    const { container, onClose, upload, invalidateQueries } = renderModal()
    upload.mockRejectedValue(new Error('Server error'))

    selectFile(container, 'ride.gpx')
    fireEvent.change(screen.getByPlaceholderText('Titel'), { target: { value: 'Runde' } })
    fireEvent.click(submitButton())

    await waitFor(() => expect(upload).toHaveBeenCalled())
    await waitFor(() => expect(submitButton().disabled).toBe(false))
    expect(onClose).not.toHaveBeenCalled()
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('requires a name if nameRequired is set', () => {
    const { container } = renderModal({ nameRequired: true })

    selectFile(container, 'ride.gpx')
    expect(submitButton().disabled).toBe(true)

    fireEvent.change(screen.getByPlaceholderText('Titel'), { target: { value: 'Runde' } })
    expect(submitButton().disabled).toBe(false)
  })

  it('ignores files that are not GPX and shows a hint in the modal', () => {
    const { container } = renderModal({ nameRequired: false })

    selectFile(container, 'ride.fit')

    expect(screen.getByRole('alert').textContent).toBe('Bitte nur GPX-Dateien hochladen.')
    expect(submitButton().disabled).toBe(true)

    selectFile(container, 'ride.gpx')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('closes on Escape and on a click on the backdrop, not on a click inside', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
