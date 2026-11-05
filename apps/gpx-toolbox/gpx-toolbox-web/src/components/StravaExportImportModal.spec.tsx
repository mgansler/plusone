import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StravaExportImportModal } from './StravaExportImportModal'

/** A file as the browser reports it for a selected folder */
function file(path: string, content = '<gpx/>') {
  const result = new File([content], path.split('/').pop() ?? path)
  Object.defineProperty(result, 'webkitRelativePath', { value: path })
  return result
}

const CSV =
  'Route Name,Route Filename\nAlb Kehren,routes/2.gpx\n"Din -> Pietra, Variante 1",routes/46.gpx\nBali,routes/25.gpx\n'
const exportFiles = [
  file('export_1/routes.csv', CSV),
  file('export_1/routes/2.gpx'),
  file('export_1/routes/46.gpx'),
  file('export_1/routes/25.gpx'),
  file('export_1/activities.csv', 'Activity ID\n1'),
]

function renderModal() {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const onClose = vi.fn()
  const result = render(
    <QueryClientProvider client={queryClient}>
      <StravaExportImportModal invalidateQueryKeys={[['routes']]} onClose={onClose} />
    </QueryClientProvider>,
  )
  return { ...result, invalidateQueries, onClose }
}

async function selectFolder(container: HTMLElement, files: Array<File>) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files } })
}

const importButton = () => screen.getByRole('button', { name: 'Importieren' }) as HTMLButtonElement

/** Answers the uploads in order, `{ duplicate: true }` for a route the user already has */
function mockUploads(...responses: Array<Response>) {
  const fetchMock = vi.fn()
  for (const response of responses) fetchMock.mockResolvedValueOnce(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const created = (duplicate = false) => new Response(JSON.stringify({ id: 'r', duplicate }), { status: 201 })

describe('StravaExportImportModal', () => {
  beforeEach(() => {
    localStorage.setItem('gpx-toolbox-jwt', 'jwt-1')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('explains what is read and cannot be started without a folder', () => {
    renderModal()

    expect(screen.getByText(/Gelesen werden nur die/)).toBeTruthy()
    expect(importButton().disabled).toBe(true)
  })

  it('counts the routes of the selected export folder', async () => {
    const { container } = renderModal()

    await selectFolder(container, exportFiles)

    expect((await screen.findByRole('status')).textContent).toBe('3 Routen gefunden.')
    expect(importButton().disabled).toBe(false)
  })

  it('warns about routes without GPX file', async () => {
    const { container } = renderModal()

    await selectFolder(
      container,
      exportFiles.filter((f) => !f.webkitRelativePath.endsWith('/25.gpx')),
    )

    expect((await screen.findByRole('status')).textContent).toContain('Zu 1 davon fehlt die GPX-Datei')
    expect(importButton().disabled).toBe(false)
  })

  it('cannot import when none of the GPX files is there', async () => {
    const { container } = renderModal()

    await selectFolder(container, [file('export_1/routes.csv', CSV)])

    await screen.findByRole('status')
    expect(importButton().disabled).toBe(true)
  })

  it('tells when the folder is not a Strava export', async () => {
    const { container } = renderModal()

    await selectFolder(container, [file('Downloads/foto.jpg')])

    expect((await screen.findByRole('alert')).textContent).toContain('keine routes.csv')
    expect(importButton().disabled).toBe(true)
  })

  it('tells when the routes.csv is of another kind', async () => {
    const { container } = renderModal()

    await selectFolder(container, [file('export_1/routes.csv', 'Activity ID,Name\n1,Ride')])

    expect((await screen.findByRole('alert')).textContent).toContain('keine routes.csv eines Strava-Exports')
  })

  it('tells when the routes.csv is empty', async () => {
    const { container } = renderModal()

    await selectFolder(container, [file('export_1/routes.csv', 'Route Name,Route Filename\n')])

    expect((await screen.findByRole('alert')).textContent).toBe('Die routes.csv enthält keine Routen.')
  })

  it('uploads every route with the name of the CSV and skips duplicates of existing routes', async () => {
    const fetchMock = mockUploads(created(), created(true), created())
    const { container, invalidateQueries } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    expect((await screen.findByRole('status')).textContent).toContain('Der Import ist fertig.')
    expect(screen.getByText('2 Routen importiert')).toBeTruthy()
    expect(screen.getByText('1 übersprungen, weil sie schon vorhanden sind')).toBeTruthy()
    expect(screen.queryByText(/fehlgeschlagen/)).toBeNull()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    const bodies = fetchMock.mock.calls.map((call) => call[1].body as FormData)
    expect(bodies.map((body) => body.get('name'))).toEqual(['Alb Kehren', 'Din -> Pietra, Variante 1', 'Bali'])
    expect(bodies.map((body) => (body.get('file') as File).name)).toEqual(['2.gpx', '46.gpx', '25.gpx'])
    expect(bodies.every((body) => body.get('source') === 'manualImport' && body.get('skipDuplicate') === 'true')).toBe(
      true,
    )
    expect(fetchMock).toHaveBeenCalledWith('/api/routes', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer jwt-1' })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['routes'] })
  })

  it('lists the routes that failed with the reason and imports the others', async () => {
    mockUploads(
      new Response(JSON.stringify({ message: 'No track points found in GPX file', statusCode: 400 }), { status: 400 }),
      created(),
      new Response('Bad Gateway', { status: 502 }),
    )
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    await screen.findByText('2 fehlgeschlagen')
    expect(screen.getByText('1 Routen importiert')).toBeTruthy()
    expect(screen.getByText('Alb Kehren: No track points found in GPX file')).toBeTruthy()
    expect(screen.getByText('Bali: Bad Gateway')).toBeTruthy()
  })

  it('counts a route whose file is missing as failed, without a request', async () => {
    const fetchMock = mockUploads(created(), created())
    const { container } = renderModal()
    await selectFolder(
      container,
      exportFiles.filter((f) => !f.webkitRelativePath.endsWith('/46.gpx')),
    )
    await screen.findByRole('status')

    fireEvent.click(importButton())

    await screen.findByText('1 fehlgeschlagen')
    expect(screen.getByText('Din -> Pietra, Variante 1: Die Datei routes/46.gpx fehlt im Ordner.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('stops at the first answer of a server that does not know the duplicate check', async () => {
    // An old server ignores skipDuplicate and answers without the duplicate flag
    const fetchMock = mockUploads(new Response(JSON.stringify({ id: 'r1', name: 'Alb Kehren' }), { status: 201 }))
    const { container, invalidateQueries } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    expect((await screen.findByRole('alert')).textContent).toContain('Starte den Server neu')
    expect(screen.getByText('Der Import wurde abgebrochen.')).toBeTruthy()
    expect(screen.getByText('2 nicht mehr bearbeitet')).toBeTruthy()
    // Nothing is copied any further
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['routes'] })
  })

  it('counts a network error as failed and goes on', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockImplementation(() => Promise.resolve(created()))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    await screen.findByText('1 fehlgeschlagen')
    expect(screen.getByText('Alb Kehren: Failed to fetch')).toBeTruthy()
    expect(screen.getByText('2 Routen importiert')).toBeTruthy()
  })

  it('stops after the current route when the import is cancelled', async () => {
    let finishFirst: (response: Response) => void = () => undefined
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(new Promise<Response>((resolve) => (finishFirst = resolve)))
      .mockImplementation(() => Promise.resolve(created()))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')
    fireEvent.click(importButton())

    fireEvent.click(await screen.findByRole('button', { name: 'Abbrechen' }))
    finishFirst(created())

    expect((await screen.findByRole('status')).textContent).toContain('Der Import wurde abgebrochen.')
    expect(screen.getByText('1 Routen importiert')).toBeTruthy()
    expect(screen.getByText('2 nicht mehr bearbeitet')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows the progress while importing', async () => {
    let finishFirst: (response: Response) => void = () => undefined
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockReturnValueOnce(new Promise<Response>((resolve) => (finishFirst = resolve)))
        .mockImplementation(() => Promise.resolve(created())),
    )
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    expect(await screen.findByText('Importiere Route 1 von 3 …')).toBeTruthy()
    finishFirst(created())
    await waitFor(() => expect(screen.getByText('Der Import ist fertig.')).toBeTruthy())
  })

  it('closes with the button after the import', async () => {
    mockUploads(created(), created(), created())
    const { container, onClose } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')
    fireEvent.click(importButton())

    fireEvent.click(await screen.findByRole('button', { name: 'Schließen' }))

    expect(onClose).toHaveBeenCalled()
  })
})
