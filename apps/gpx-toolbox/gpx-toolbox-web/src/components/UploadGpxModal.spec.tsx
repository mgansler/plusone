import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UploadGpxModal } from './UploadGpxModal'

function renderModal(props: Partial<Parameters<typeof UploadGpxModal>[0]> = {}) {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const onClose = vi.fn()
  const result = render(
    <QueryClientProvider client={queryClient}>
      <UploadGpxModal
        heading="Aktivität hochladen"
        endpoint="/api/import/activity"
        nameField="title"
        namePlaceholder="Titel"
        invalidateQueryKeys={[['activities'], ['routes']]}
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  )
  return { ...result, invalidateQueries, onClose }
}

function selectFile(container: HTMLElement, name: string) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [new File(['<gpx></gpx>'], name)] } })
}

const submitButton = () => screen.getByRole('button', { name: 'Hochladen' }) as HTMLButtonElement

describe('UploadGpxModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts file, name and extra fields to the endpoint and refetches the given queries', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const { container, invalidateQueries, onClose } = renderModal({ extraFields: { source: 'manualImport' } })

    selectFile(container, 'ride.gpx')
    fireEvent.change(screen.getByPlaceholderText('Titel'), { target: { value: ' Feierabendrunde ' } })
    fireEvent.click(submitButton())

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]
    const body = init.body as FormData
    expect(url).toBe('/api/import/activity')
    expect((body.get('file') as File).name).toBe('ride.gpx')
    expect(body.get('title')).toBe('Feierabendrunde')
    expect(body.get('source')).toBe('manualImport')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activities'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['routes'] })
  })

  it('omits an empty optional name', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const { container, onClose } = renderModal({ nameRequired: false })

    selectFile(container, 'ride.gpx')
    expect(submitButton().disabled).toBe(false)
    fireEvent.click(submitButton())

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect((fetchMock.mock.calls[0][1].body as FormData).has('title')).toBe(false)
  })

  it('requires a name if nameRequired is set', () => {
    const { container } = renderModal({ nameRequired: true })

    selectFile(container, 'ride.gpx')
    expect(submitButton().disabled).toBe(true)

    fireEvent.change(screen.getByPlaceholderText('Titel'), { target: { value: 'Runde' } })
    expect(submitButton().disabled).toBe(false)
  })

  it('ignores files that are not GPX', () => {
    vi.stubGlobal('alert', vi.fn())
    const { container } = renderModal({ nameRequired: false })

    selectFile(container, 'ride.fit')

    expect(alert).toHaveBeenCalled()
    expect(submitButton().disabled).toBe(true)
  })
})
