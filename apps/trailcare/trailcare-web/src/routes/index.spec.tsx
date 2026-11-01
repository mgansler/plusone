import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import { CareType } from '@plusone/trailcare-api-client'

import { fakeApi, httpError } from '../test/fake-api'
import { ADMIN, AREAS, careEntry, USER } from '../test/fixtures'
import { renderApp } from '../test/render-app'

const UNDOABLE = () => new Date(Date.now() + 15_000).toISOString()

function row(name: string) {
  return screen.getByText(name).closest('li') as HTMLElement
}

describe('trail list', () => {
  beforeEach(() => {
    fakeApi.on('GET', '/api/auth/session', USER).on('GET', '/api/trail-areas', AREAS)
  })

  it('shows the trails per area with their traffic light', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Heslach' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Solitude' })).toBeTruthy()

    expect(row('Klabuster').dataset.status).toBe('GREEN')
    expect(within(row('Klabuster')).getByText('Gestern gefegt')).toBeTruthy()
    expect(within(row('Saubuckel')).getByText('Vor 3 Tagen gefegt')).toBeTruthy()
    expect(within(row('Schwälblesklinge')).getByText('Noch nie gefegt')).toBeTruthy()
    expect(within(row('Schwälblesklinge')).getByRole('img').textContent).toBe('–')
  })

  it('highlights the latest work if it was not sweeping', async () => {
    renderApp('/')
    expect(
      within(await screen.findByText('Jojo').then(() => row('Jojo'))).getByText('Heute: Baum im Trail'),
    ).toBeTruthy()
    expect(within(row('Klabuster')).queryByText(/Heute:/)).toBeNull()
  })

  it('searches names and aliases', async () => {
    renderApp('/')
    const search = await screen.findByRole('searchbox', { name: 'Trail nach Name suchen' })

    fireEvent.change(search, { target: { value: 'yoyo' } })
    expect(screen.getByText('Jojo')).toBeTruthy()
    expect(screen.getByText('auch „Yoyo“')).toBeTruthy()
    expect(screen.queryByText('Klabuster')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Heslach' })).toBeNull()

    fireEvent.change(search, { target: { value: 'gibtsnicht' } })
    expect(screen.getByText('Kein Trail heißt „gibtsnicht“. Probier einen anderen Namen.')).toBeTruthy()

    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByText('Klabuster')).toBeTruthy()
  })

  it('collapses areas and remembers it', async () => {
    const { unmount } = renderApp('/')
    const heslach = await screen.findByRole('button', { name: 'Heslach' })
    expect(heslach.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(heslach)
    expect(heslach.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Klabuster')).toBeNull()
    // The summary tells how many trails are hidden and how many need sweeping
    expect(within(heslach).getByText('3 Trails · 1× fegen nötig')).toBeTruthy()
    expect(screen.getByText('Jojo')).toBeTruthy()

    unmount()
    renderApp('/')
    expect((await screen.findByRole('button', { name: /Heslach/ })).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Klabuster')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Heslach/ }))
    expect(screen.getByText('Klabuster')).toBeTruthy()
  })

  it('shows search results in collapsed areas', async () => {
    renderApp('/')
    fireEvent.click(await screen.findByRole('button', { name: 'Heslach' }))

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'klab' } })
    const heslach = screen.getByRole<HTMLButtonElement>('button', { name: 'Heslach' })
    expect(screen.getByText('Klabuster')).toBeTruthy()
    expect(heslach.disabled).toBe(true)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } })
    expect(screen.queryByText('Klabuster')).toBeNull()
  })

  it('sweeps a trail with one tap and offers undo', async () => {
    fakeApi.on('POST', '/api/trails/2/care-entries', careEntry({ id: 9, trailId: 2, undoableUntil: UNDOABLE() }))
    fakeApi.on('DELETE', '/api/care-entries/9', undefined)
    renderApp('/')

    fireEvent.click(await screen.findByRole('button', { name: 'Saubuckel jetzt als gefegt eintragen' }))

    expect(await screen.findByText('Gefegt eingetragen: Saubuckel')).toBeTruthy()
    expect(fakeApi.bodies('POST', '/api/trails/2/care-entries')).toEqual([{ type: CareType.SWEPT }])
    expect(row('Saubuckel').dataset.justSwept).toBe('true')
    // The list is reloaded to show the new status
    await waitFor(() => expect(fakeApi.calls('GET', '/api/trail-areas').length).toBeGreaterThan(1))

    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
    expect(await screen.findByText('Rückgängig gemacht')).toBeTruthy()
    expect(fakeApi.calls('DELETE', '/api/care-entries/9')).toHaveLength(1)
  })

  it('reports a failed sweep', async () => {
    fakeApi.on('POST', '/api/trails/1/care-entries', () => {
      throw httpError(500)
    })
    renderApp('/')

    fireEvent.click(await screen.findByRole('button', { name: 'Klabuster jetzt als gefegt eintragen' }))

    expect(await screen.findByText('Das hat nicht geklappt. Bitte versuch es nochmal.')).toBeTruthy()
    expect(row('Klabuster').dataset.justSwept).toBeUndefined()
  })

  it('links each trail to its page', async () => {
    const { router } = renderApp('/')
    fakeApi.on('GET', '/api/trails/4', AREAS[1].trails[0]).on('GET', '/api/trails/4/care-entries', [])

    fireEvent.click(await screen.findByText('Jojo'))

    await waitFor(() => expect(router.state.location.pathname).toBe('/trails/4'))
  })

  it.each([
    [USER, 'Ein Admin muss zuerst Trails anlegen.'],
    [ADMIN, 'Leg in der Verwaltung ein Trailgebiet mit Trails an.'],
  ])('explains what to do without trails', async (session, hint) => {
    fakeApi.on('GET', '/api/auth/session', session).on('GET', '/api/trail-areas', [])
    renderApp('/')

    expect(await screen.findByText('Es gibt noch keine Trails.')).toBeTruthy()
    expect(screen.getByText(hint)).toBeTruthy()
  })

  it('shows areas without trails', async () => {
    fakeApi.on('GET', '/api/trail-areas', [{ id: 30, name: 'Birkenkopf', trails: [] }])
    renderApp('/')
    expect(await screen.findByText('Noch keine Trails in diesem Gebiet.')).toBeTruthy()
  })
})
