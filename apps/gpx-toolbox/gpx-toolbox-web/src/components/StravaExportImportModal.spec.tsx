import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { importGpx } from '@plusone/gpx-toolbox-api-client'

import { StravaExportImportModal } from './StravaExportImportModal'

vi.mock('@plusone/gpx-toolbox-api-client', () => ({
  importGpx: vi.fn(),
  ImportRouteUploadDtoSource: { manualImport: 'manualImport' },
}))

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

const created = (duplicate = false) => ({
  id: 'r',
  name: 'Route',
  totalDistance: 1,
  elevationGain: 1,
  elevationLoss: 1,
  duplicate,
})

/** A failed request as axios reports it */
function failure(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  })
}

/** Answers the uploads in order */
function mockUploads(...results: Array<ReturnType<typeof created> | Error>) {
  const upload = vi.mocked(importGpx)
  for (const result of results) {
    if (result instanceof Error) upload.mockRejectedValueOnce(result)
    else upload.mockResolvedValueOnce(result)
  }
  return upload
}

describe('StravaExportImportModal', () => {
  beforeEach(() => {
    vi.mocked(importGpx).mockReset()
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
    const upload = mockUploads(created(), created(true), created())
    const { container, invalidateQueries } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    expect((await screen.findByRole('status')).textContent).toContain('Der Import ist fertig.')
    expect(screen.getByText('2 Routen importiert')).toBeTruthy()
    expect(screen.getByText('1 übersprungen, weil sie schon vorhanden sind')).toBeTruthy()
    expect(screen.queryByText(/fehlgeschlagen/)).toBeNull()

    expect(upload).toHaveBeenCalledTimes(3)
    const calls = upload.mock.calls.map(([body]) => body)
    expect(calls.map((body) => body.name)).toEqual(['Alb Kehren', 'Din -> Pietra, Variante 1', 'Bali'])
    expect(calls.map((body) => (body.file as File).name)).toEqual(['2.gpx', '46.gpx', '25.gpx'])
    expect(calls.every((body) => body.source === 'manualImport' && body.skipDuplicate === true)).toBe(true)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['routes'] })
  })

  it('lists the routes that failed with the reason and imports the others', async () => {
    mockUploads(
      failure(400, { message: 'No track points found in GPX file', statusCode: 400 }),
      created(),
      failure(502, 'Bad Gateway'),
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

  it('names the status of a failed request without a message', async () => {
    mockUploads(failure(500, ''), created(), created())
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    expect(await screen.findByText('Alb Kehren: Fehler 500')).toBeTruthy()
  })

  it('counts a route whose file is missing as failed, without a request', async () => {
    const upload = mockUploads(created(), created())
    const { container } = renderModal()
    await selectFolder(
      container,
      exportFiles.filter((f) => !f.webkitRelativePath.endsWith('/46.gpx')),
    )
    await screen.findByRole('status')

    fireEvent.click(importButton())

    await screen.findByText('1 fehlgeschlagen')
    expect(screen.getByText('Din -> Pietra, Variante 1: Die Datei routes/46.gpx fehlt im Ordner.')).toBeTruthy()
    expect(upload).toHaveBeenCalledTimes(2)
  })

  it('stops at the first answer of a server that does not know the duplicate check', async () => {
    // An old server ignores skipDuplicate and answers without the duplicate flag
    const { duplicate: _duplicate, ...withoutFlag } = created()
    const upload = vi.mocked(importGpx)
    upload.mockResolvedValueOnce(withoutFlag as ReturnType<typeof created>)
    const { container, invalidateQueries } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    expect((await screen.findByRole('alert')).textContent).toContain('Starte den Server neu')
    expect(screen.getByText('Der Import wurde abgebrochen.')).toBeTruthy()
    expect(screen.getByText('2 nicht mehr bearbeitet')).toBeTruthy()
    // Nothing is copied any further
    expect(upload).toHaveBeenCalledTimes(1)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['routes'] })
  })

  it('counts a network error as failed and goes on', async () => {
    const upload = mockUploads(new Error('Network Error'), created(), created())
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')

    fireEvent.click(importButton())

    await screen.findByText('1 fehlgeschlagen')
    expect(screen.getByText('Alb Kehren: Network Error')).toBeTruthy()
    expect(screen.getByText('2 Routen importiert')).toBeTruthy()
    expect(upload).toHaveBeenCalledTimes(3)
  })

  it('stops after the current route when the import is cancelled', async () => {
    let finishFirst: (result: ReturnType<typeof created>) => void = () => undefined
    const upload = vi.mocked(importGpx)
    upload.mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))
    upload.mockImplementation(() => Promise.resolve(created()))
    const { container } = renderModal()
    await selectFolder(container, exportFiles)
    await screen.findByRole('status')
    fireEvent.click(importButton())

    fireEvent.click(await screen.findByRole('button', { name: 'Abbrechen' }))
    finishFirst(created())

    expect((await screen.findByRole('status')).textContent).toContain('Der Import wurde abgebrochen.')
    expect(screen.getByText('1 Routen importiert')).toBeTruthy()
    expect(screen.getByText('2 nicht mehr bearbeitet')).toBeTruthy()
    expect(upload).toHaveBeenCalledTimes(1)
  })

  it('shows the progress while importing', async () => {
    let finishFirst: (result: ReturnType<typeof created>) => void = () => undefined
    const upload = vi.mocked(importGpx)
    upload.mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))
    upload.mockImplementation(() => Promise.resolve(created()))
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
