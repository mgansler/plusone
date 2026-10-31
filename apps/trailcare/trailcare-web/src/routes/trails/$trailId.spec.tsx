import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import { CareType, SweepStatus } from '@plusone/trailcare-api-client'

import { toDayKey } from '../../lib/format'
import { fakeApi, httpError } from '../../test/fake-api'
import { ADMIN, careEntry, trail, USER } from '../../test/fixtures'
import { renderApp } from '../../test/render-app'

const JOJO = trail({
  id: 4,
  name: 'Jojo',
  trailAreaName: 'Solitude',
  aliases: ['Yoyo', 'JJ'],
  sweepStatus: SweepStatus.RED,
  daysSinceSwept: 9,
  sweepGreenMaxDays: 1,
})

const LOG = [
  careEntry({
    id: 2,
    trailId: 4,
    type: CareType.FALLEN_TREE,
    performedAt: '2026-10-29T12:00:00.000Z',
    comment: 'Fichte nach dem Drop',
    performedBy: 'Mia',
  }),
  careEntry({ id: 1, trailId: 4, type: CareType.SWEPT, performedAt: '2026-10-22T12:00:00.000Z' }),
]

function setup(session = USER, entries = LOG) {
  fakeApi
    .on('GET', '/api/auth/session', session)
    .on('GET', '/api/trails/4', JOJO)
    .on('GET', '/api/trails/4/care-entries', entries)
  return renderApp('/trails/4')
}

describe('trail page', () => {
  it('shows status, thresholds and the care log', async () => {
    setup()

    expect(await screen.findByRole('heading', { name: 'Jojo' })).toBeTruthy()
    expect(screen.getByText('Solitude')).toBeTruthy()
    expect(screen.getByText('auch Yoyo, JJ')).toBeTruthy()
    expect(screen.getByText('Vor 9 Tagen gefegt')).toBeTruthy()
    expect(screen.getByText('Grün bis 1 Tag, gelb bis 4 Tage nach dem Fegen')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'fegen nötig' }).textContent).toBe('9')

    const items = await screen.findAllByRole('listitem')
    expect(items.map((item) => within(item).getByText(/Gefegt|Baum im Trail/).textContent)).toEqual([
      'Baum im Trail',
      'Gefegt',
    ])
    expect(within(items[0]).getByText('Fichte nach dem Drop')).toBeTruthy()
    expect(within(items[0]).getByText('Mia')).toBeTruthy()
    expect(within(items[0]).getByText('Do., 29. Okt. 2026')).toBeTruthy()
  })

  it('invites to add the first entry', async () => {
    setup(USER, [])
    expect(await screen.findByText('Noch keine Einträge. Trag ein, was du am Trail gemacht hast.')).toBeTruthy()
  })

  it('shows an error for unknown trails', async () => {
    fakeApi.on('GET', '/api/auth/session', USER).on('GET', '/api/trails/99', () => {
      throw httpError(404, 'Not Found', '/api/trails/99')
    })
    fakeApi.on('GET', '/api/trails/99/care-entries', [])
    renderApp('/trails/99')
    expect(await screen.findByText('Not Found')).toBeTruthy()
  })

  it('sweeps today with the big button', async () => {
    fakeApi.on('POST', '/api/trails/4/care-entries', careEntry({ id: 9, trailId: 4 }))
    setup()

    fireEvent.click(await screen.findByRole('button', { name: 'Heute gefegt' }))

    expect(await screen.findByText('Gefegt eingetragen: Jojo')).toBeTruthy()
    expect(fakeApi.bodies('POST', '/api/trails/4/care-entries')).toEqual([{ type: CareType.SWEPT }])
  })

  it('records other work on an earlier day and remembers the name', async () => {
    fakeApi.on('POST', '/api/trails/4/care-entries', careEntry({ id: 9, trailId: 4, type: CareType.FALLEN_TREE }))
    setup()

    fireEvent.click(await screen.findByText('Anderes Datum oder andere Arbeit eintragen'))
    const today = toDayKey(new Date())
    const dateInput = screen.getByLabelText<HTMLInputElement>('Wann?')
    expect(dateInput.value).toBe(today)
    expect(dateInput.max).toBe(today)

    fireEvent.click(screen.getByRole('radio', { name: 'Baum im Trail' }))
    expect(screen.getByLabelText<HTMLTextAreaElement>('Kommentar (optional)').placeholder).toBe(
      'Wo liegt der Baum? Kommt man vorbei?',
    )
    fireEvent.change(dateInput, { target: { value: '2026-10-30' } })
    fireEvent.change(screen.getByLabelText('Dein Name (optional)'), { target: { value: ' Jonas ' } })
    fireEvent.change(screen.getByLabelText('Kommentar (optional)'), { target: { value: 'Liegt quer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Eintragen' }))

    expect(await screen.findByText('Baum im Trail gemeldet: Jojo')).toBeTruthy()
    const [body] = fakeApi.bodies('POST', '/api/trails/4/care-entries') as Array<Record<string, string>>
    expect(body).toMatchObject({ type: CareType.FALLEN_TREE, performedBy: 'Jonas', comment: 'Liegt quer' })
    expect(toDayKey(new Date(body.performedAt))).toBe('2026-10-30')
    expect(new Date(body.performedAt).getHours()).toBe(12)

    // The comment is cleared for the next entry, the name stays
    await waitFor(() => expect(screen.getByLabelText<HTMLTextAreaElement>('Kommentar (optional)').value).toBe(''))
    expect(localStorage.getItem('trailcare-name')).toBe('Jonas')
  })

  it('sends no date for today and prefills the remembered name', async () => {
    localStorage.setItem('trailcare-name', 'Mia')
    fakeApi.on('POST', '/api/trails/4/care-entries', careEntry({ id: 9, trailId: 4 }))
    setup()

    fireEvent.click(await screen.findByText('Anderes Datum oder andere Arbeit eintragen'))
    expect(screen.getByLabelText<HTMLInputElement>('Dein Name (optional)').value).toBe('Mia')
    fireEvent.click(screen.getByRole('button', { name: 'Eintragen' }))

    await screen.findByText('Gefegt eingetragen: Jojo')
    expect(fakeApi.bodies('POST', '/api/trails/4/care-entries')).toEqual([
      { type: CareType.SWEPT, performedAt: undefined, performedBy: 'Mia', comment: undefined },
    ])
  })

  it('hides editing from users', async () => {
    setup()
    await screen.findByText('Fichte nach dem Drop')
    expect(screen.queryByRole('button', { name: 'Bearbeiten' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Trail bearbeiten' })).toBeNull()
  })

  describe('as admin', () => {
    it('links to the trail settings', async () => {
      setup(ADMIN)
      const link = await screen.findByRole('link', { name: 'Trail bearbeiten' })
      expect(link.getAttribute('href')).toBe('/admin/trails/4')
    })

    it('edits a log entry', async () => {
      fakeApi.on('PUT', '/api/care-entries/2', careEntry({ id: 2 }))
      setup(ADMIN)

      const [first] = await screen.findAllByRole('button', { name: 'Bearbeiten' })
      fireEvent.click(first)
      expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('Mia')

      fireEvent.change(screen.getByLabelText('Art'), { target: { value: CareType.CUT_BACK } })
      fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } })
      fireEvent.change(screen.getByLabelText('Kommentar'), { target: { value: 'Ast statt Baum' } })
      fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

      await waitFor(() => expect(screen.queryByRole('button', { name: 'Speichern' })).toBeNull())
      // Unchanged day: the original time is kept
      expect(fakeApi.bodies('PUT', '/api/care-entries/2')).toEqual([
        { type: CareType.CUT_BACK, performedAt: undefined, performedBy: '', comment: 'Ast statt Baum' },
      ])
    })

    it('moves an entry to another day', async () => {
      fakeApi.on('PUT', '/api/care-entries/2', careEntry({ id: 2 }))
      setup(ADMIN)

      fireEvent.click((await screen.findAllByRole('button', { name: 'Bearbeiten' }))[0])
      fireEvent.change(screen.getByLabelText('Datum'), { target: { value: '2026-10-27' } })
      fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

      await waitFor(() => expect(fakeApi.calls('PUT', '/api/care-entries/2')).toHaveLength(1))
      const [body] = fakeApi.bodies('PUT', '/api/care-entries/2') as Array<{ performedAt: string }>
      expect(toDayKey(new Date(body.performedAt))).toBe('2026-10-27')
    })

    it('cancels editing', async () => {
      setup(ADMIN)
      fireEvent.click((await screen.findAllByRole('button', { name: 'Bearbeiten' }))[0])
      fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
      expect(screen.getByText('Fichte nach dem Drop')).toBeTruthy()
      expect(fakeApi.calls('PUT', '/api/care-entries/2')).toHaveLength(0)
    })

    it('deletes an entry after confirming', async () => {
      fakeApi.on('DELETE', '/api/care-entries/2', undefined)
      const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
      vi.stubGlobal('confirm', confirm)
      setup(ADMIN)

      fireEvent.click((await screen.findAllByRole('button', { name: 'Bearbeiten' }))[0])
      fireEvent.click(screen.getByRole('button', { name: 'Löschen' }))
      expect(confirm).toHaveBeenCalledWith('Eintrag „Baum im Trail“ vom Do., 29. Okt. 2026 löschen?')
      expect(fakeApi.calls('DELETE', '/api/care-entries/2')).toHaveLength(0)

      fireEvent.click(screen.getByRole('button', { name: 'Löschen' }))
      await waitFor(() => expect(fakeApi.calls('DELETE', '/api/care-entries/2')).toHaveLength(1))
    })
  })
})
