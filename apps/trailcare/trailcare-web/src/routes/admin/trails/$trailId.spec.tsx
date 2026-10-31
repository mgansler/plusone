import { fireEvent, screen, waitFor } from '@testing-library/react'

import { fakeApi, httpError } from '../../../test/fake-api'
import { ADMIN, AREAS, trail } from '../../../test/fixtures'
import { renderApp } from '../../../test/render-app'

const KLABUSTER = trail({ aliases: ['Klabi', 'KB'] })

function setup() {
  fakeApi
    .on('GET', '/api/auth/session', ADMIN)
    .on('GET', '/api/trails/1', KLABUSTER)
    .on('GET', '/api/trail-areas', AREAS)
    .on('GET', '/api/admin/access-passwords', [])
  return renderApp('/admin/trails/1')
}

describe('edit trail page', () => {
  it('prefills the form', async () => {
    setup()

    expect((await screen.findByLabelText<HTMLInputElement>('Name')).value).toBe('Klabuster')
    expect(screen.getByLabelText<HTMLTextAreaElement>('Weitere Namen, einer pro Zeile').value).toBe('Klabi\nKB')
    expect(screen.getByLabelText<HTMLInputElement>('Grün bis Tag').value).toBe('2')
    expect(screen.getByLabelText<HTMLInputElement>('Gelb bis Tag').value).toBe('4')
    await waitFor(() => expect(screen.getByLabelText<HTMLSelectElement>('Trailgebiet').value).toBe('10'))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Heslach', 'Solitude'])
  })

  it('saves name, area, aliases and thresholds', async () => {
    fakeApi.on('PUT', '/api/admin/trails/1', KLABUSTER)
    setup()

    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Klabuster Trail' } })
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2))
    fireEvent.change(screen.getByLabelText('Trailgebiet'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText('Weitere Namen, einer pro Zeile'), {
      target: { value: ' Klabi \n\nKlabuster\n' },
    })
    fireEvent.change(screen.getByLabelText('Grün bis Tag'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Gelb bis Tag'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(await screen.findByRole('button', { name: 'Gespeichert' })).toBeTruthy()
    expect(fakeApi.bodies('PUT', '/api/admin/trails/1')).toEqual([
      {
        name: 'Klabuster Trail',
        trailAreaId: 20,
        aliases: ['Klabi', 'Klabuster'],
        sweepGreenMaxDays: 3,
        sweepYellowMaxDays: 7,
      },
    ])
  })

  it('lets the threshold fields be emptied while typing', async () => {
    setup()
    const green = await screen.findByLabelText<HTMLInputElement>('Grün bis Tag')
    fireEvent.change(green, { target: { value: '' } })
    expect(green.value).toBe('')
    fireEvent.change(green, { target: { value: '3' } })
    expect(green.value).toBe('3')
  })

  it('does not allow yellow below green', async () => {
    setup()
    fireEvent.change(await screen.findByLabelText('Grün bis Tag'), { target: { value: '5' } })
    expect(screen.getByLabelText<HTMLInputElement>('Gelb bis Tag').min).toBe('5')
  })

  it('shows errors from the backend', async () => {
    fakeApi.on('PUT', '/api/admin/trails/1', () => {
      throw httpError(409, 'Ein Trail mit diesem Namen existiert in diesem Gebiet bereits')
    })
    setup()

    fireEvent.click(await screen.findByRole('button', { name: 'Speichern' }))

    expect(await screen.findByText('Ein Trail mit diesem Namen existiert in diesem Gebiet bereits')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Gespeichert' })).toBeNull()
  })

  it('deletes the trail after confirming and returns to the admin page', async () => {
    fakeApi.on('DELETE', '/api/admin/trails/1', undefined)
    const confirm = vi.fn().mockReturnValue(true)
    vi.stubGlobal('confirm', confirm)
    const { router } = setup()

    fireEvent.click(await screen.findByRole('button', { name: 'Trail löschen' }))

    expect(confirm).toHaveBeenCalledWith('„Klabuster“ mit dem ganzen Pflegelog löschen?')
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'))
    expect(fakeApi.calls('DELETE', '/api/admin/trails/1')).toHaveLength(1)
  })

  it('keeps the trail when deleting is cancelled', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false))
    setup()

    fireEvent.click(await screen.findByRole('button', { name: 'Trail löschen' }))
    expect(fakeApi.calls('DELETE', '/api/admin/trails/1')).toHaveLength(0)
  })

  it('links to the care log', async () => {
    setup()
    expect((await screen.findByRole('link', { name: 'Zum Pflegelog' })).getAttribute('href')).toBe('/trails/1')
  })
})
