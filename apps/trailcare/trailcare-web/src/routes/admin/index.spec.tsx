import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import type { AccessPasswordDto } from '@plusone/trailcare-api-client'

import { fakeApi, httpError } from '../../test/fake-api'
import { ADMIN, AREAS } from '../../test/fixtures'
import { renderApp } from '../../test/render-app'

const PASSWORDS: Array<AccessPasswordDto> = [
  {
    id: 1,
    label: 'Initial',
    activeSessions: 3,
    lastUsedAt: new Date().toISOString(),
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 2,
    label: 'Crew Süd',
    activeSessions: 1,
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
  },
]

function setup() {
  fakeApi
    .on('GET', '/api/auth/session', ADMIN)
    .on('GET', '/api/trail-areas', AREAS)
    .on('GET', '/api/admin/access-passwords', PASSWORDS)
  return renderApp('/admin')
}

function areaSection(name: string) {
  return screen.getByRole('heading', { name }).closest('section') as HTMLElement
}

function passwordItem(label: string) {
  return screen.getByText(label).closest('li') as HTMLElement
}

describe('admin page', () => {
  describe('trail areas and trails', () => {
    it('lists areas with their trails and aliases', async () => {
      setup()

      const heslach = areaSection(await screen.findByRole('heading', { name: 'Heslach' }).then(() => 'Heslach'))
      expect(
        within(heslach)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(['Klabuster', 'Saubuckel', 'Schwälblesklinge'])
      expect(within(areaSection('Solitude')).getByText('auch Yoyo')).toBeTruthy()
      // The link name also contains the traffic light for screen readers
      expect(within(heslach).getByRole('link', { name: 'frisch gefegt Klabuster' }).getAttribute('href')).toBe(
        '/admin/trails/1',
      )
    })

    it('creates an area and reloads the list', async () => {
      fakeApi.on('POST', '/api/admin/trail-areas', { id: 30, name: 'Birkenkopf' })
      setup()

      const input = await screen.findByLabelText<HTMLInputElement>('Neues Trailgebiet')
      fireEvent.change(input, { target: { value: 'Birkenkopf' } })
      fireEvent.click(screen.getByRole('button', { name: 'Anlegen' }))

      await waitFor(() => expect(input.value).toBe(''))
      expect(fakeApi.bodies('POST', '/api/admin/trail-areas')).toEqual([{ name: 'Birkenkopf' }])
      expect(fakeApi.calls('GET', '/api/trail-areas').length).toBeGreaterThan(1)
    })

    it('shows conflicts from the backend', async () => {
      fakeApi.on('POST', '/api/admin/trail-areas', () => {
        throw httpError(409, 'Ein Trailgebiet mit diesem Namen existiert bereits')
      })
      setup()

      fireEvent.change(await screen.findByLabelText('Neues Trailgebiet'), { target: { value: 'Heslach' } })
      fireEvent.click(screen.getByRole('button', { name: 'Anlegen' }))

      expect(await screen.findByText('Ein Trailgebiet mit diesem Namen existiert bereits')).toBeTruthy()
    })

    it('renames an area', async () => {
      fakeApi.on('PUT', '/api/admin/trail-areas/10', { id: 10, name: 'Heslach West' })
      setup()

      await screen.findByRole('heading', { name: 'Heslach' })
      fireEvent.click(within(areaSection('Heslach')).getByRole('button', { name: 'Umbenennen' }))
      const input = screen.getByLabelText<HTMLInputElement>('Name des Trailgebiets')
      expect(input.value).toBe('Heslach')
      fireEvent.change(input, { target: { value: 'Heslach West' } })
      fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

      await waitFor(() => expect(screen.queryByLabelText('Name des Trailgebiets')).toBeNull())
      expect(fakeApi.bodies('PUT', '/api/admin/trail-areas/10')).toEqual([{ name: 'Heslach West' }])
    })

    it('restores the name when renaming is cancelled', async () => {
      setup()
      await screen.findByRole('heading', { name: 'Heslach' })
      fireEvent.click(within(areaSection('Heslach')).getByRole('button', { name: 'Umbenennen' }))
      fireEvent.change(screen.getByLabelText('Name des Trailgebiets'), { target: { value: 'Tippfehler' } })
      fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))

      fireEvent.click(within(areaSection('Heslach')).getByRole('button', { name: 'Umbenennen' }))
      expect(screen.getByLabelText<HTMLInputElement>('Name des Trailgebiets').value).toBe('Heslach')
    })

    it('asks before deleting an area with its trails', async () => {
      fakeApi.on('DELETE', '/api/admin/trail-areas/10', undefined).on('DELETE', '/api/admin/trail-areas/20', undefined)
      const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValue(true)
      vi.stubGlobal('confirm', confirm)
      setup()

      await screen.findByRole('heading', { name: 'Heslach' })
      fireEvent.click(within(areaSection('Heslach')).getByRole('button', { name: 'Löschen' }))
      expect(confirm).toHaveBeenLastCalledWith('„Heslach“ mit 3 Trails und dem ganzen Pflegelog löschen?')
      expect(fakeApi.calls('DELETE', '/api/admin/trail-areas/10')).toHaveLength(0)

      fireEvent.click(within(areaSection('Solitude')).getByRole('button', { name: 'Löschen' }))
      expect(confirm).toHaveBeenLastCalledWith('„Solitude“ mit einem Trail und dem ganzen Pflegelog löschen?')
      await waitFor(() => expect(fakeApi.calls('DELETE', '/api/admin/trail-areas/20')).toHaveLength(1))
    })

    it('adds a trail to an area', async () => {
      fakeApi.on('POST', '/api/admin/trail-areas/20/trails', { id: 5 })
      setup()

      await screen.findByRole('heading', { name: 'Solitude' })
      const solitude = areaSection('Solitude')
      const input = within(solitude).getByLabelText<HTMLInputElement>('Trail hinzufügen')
      const add = within(solitude).getByRole<HTMLButtonElement>('button', { name: 'Hinzufügen' })
      expect(add.disabled).toBe(true)

      fireEvent.change(input, { target: { value: 'Äffle und Pferdle' } })
      fireEvent.click(add)

      await waitFor(() => expect(input.value).toBe(''))
      expect(fakeApi.bodies('POST', '/api/admin/trail-areas/20/trails')).toEqual([{ name: 'Äffle und Pferdle' }])
    })
  })

  describe('access passwords', () => {
    it('lists passwords with their usage', async () => {
      setup()

      const initial = passwordItem(await screen.findByText('Initial').then(() => 'Initial'))
      expect(within(initial).getByText('3 Geräte angemeldet, zuletzt benutzt heute')).toBeTruthy()
      expect(
        within(passwordItem('Crew Süd')).getByText('1 Gerät angemeldet, angelegt am Di., 20. Okt. 2026'),
      ).toBeTruthy()
    })

    it('warns when there is no password left', async () => {
      setup()
      fakeApi.on('GET', '/api/admin/access-passwords', [])
      renderApp('/admin')
      expect(
        await screen.findByText('Es gibt kein Passwort. Ohne Passwort kann sich niemand außer Admins anmelden.'),
      ).toBeTruthy()
    })

    it('creates a password and shows it once', async () => {
      fakeApi.on('POST', '/api/admin/access-passwords', {
        ...PASSWORDS[1],
        id: 3,
        label: 'Gäste',
        password: 'abcd-efgh-jkmn',
      })
      const writeText = vi.fn()
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
      setup()

      fireEvent.change(await screen.findByLabelText('Wofür ist das Passwort?'), { target: { value: 'Gäste' } })
      fireEvent.click(screen.getByRole('button', { name: 'Passwort anlegen' }))

      const revealed = await screen.findByRole('status')
      expect(within(revealed).getByText('abcd-efgh-jkmn')).toBeTruthy()
      expect(within(revealed).getByText('Gäste')).toBeTruthy()
      // Leaving the password empty lets the backend generate one
      expect(fakeApi.bodies('POST', '/api/admin/access-passwords')).toEqual([{ label: 'Gäste', password: undefined }])

      fireEvent.click(within(revealed).getByRole('button', { name: 'Kopieren' }))
      expect(writeText).toHaveBeenCalledWith('abcd-efgh-jkmn')

      fireEvent.click(within(revealed).getByRole('button', { name: 'Fertig' }))
      expect(screen.queryByText('abcd-efgh-jkmn')).toBeNull()
    })

    it('creates a password with a chosen value', async () => {
      fakeApi.on('POST', '/api/admin/access-passwords', { ...PASSWORDS[1], id: 3, password: 'eigenes-pw' })
      setup()

      fireEvent.change(await screen.findByLabelText('Wofür ist das Passwort?'), { target: { value: 'Crew Nord' } })
      fireEvent.change(screen.getByLabelText('Passwort (leer = erzeugen)'), { target: { value: 'eigenes-pw' } })
      fireEvent.click(screen.getByRole('button', { name: 'Passwort anlegen' }))

      await screen.findByRole('status')
      expect(fakeApi.bodies('POST', '/api/admin/access-passwords')).toEqual([
        { label: 'Crew Nord', password: 'eigenes-pw' },
      ])
    })

    it('changes a password after warning about logged in devices', async () => {
      fakeApi.on('POST', '/api/admin/access-passwords/1/rotate', { ...PASSWORDS[0], password: 'neu-neu-neu' })
      const prompt = vi.fn().mockReturnValueOnce(null).mockReturnValueOnce('  ')
      vi.stubGlobal('prompt', prompt)
      setup()

      const changeButton = within(passwordItem(await screen.findByText('Initial').then(() => 'Initial'))).getByRole(
        'button',
        { name: 'Passwort ändern' },
      )

      fireEvent.click(changeButton)
      expect(prompt.mock.calls[0][0]).toContain('3 Geräte angemeldet, sie werden abgemeldet')
      expect(fakeApi.calls('POST', '/api/admin/access-passwords/1/rotate')).toHaveLength(0)

      fireEvent.click(changeButton)
      expect(await screen.findByText('neu-neu-neu')).toBeTruthy()
      expect(fakeApi.bodies('POST', '/api/admin/access-passwords/1/rotate')).toEqual([{ password: undefined }])
    })

    it('renames a password', async () => {
      fakeApi.on('PUT', '/api/admin/access-passwords/2', PASSWORDS[1])
      setup()

      await screen.findByText('Crew Süd')
      fireEvent.click(within(passwordItem('Crew Süd')).getByRole('button', { name: 'Umbenennen' }))
      fireEvent.change(screen.getByLabelText('Bezeichnung'), { target: { value: 'Crew Süd-West' } })
      fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

      await waitFor(() => expect(screen.queryByLabelText('Bezeichnung')).toBeNull())
      expect(fakeApi.bodies('PUT', '/api/admin/access-passwords/2')).toEqual([{ label: 'Crew Süd-West' }])
    })

    it('deletes a password after confirming', async () => {
      fakeApi.on('DELETE', '/api/admin/access-passwords/2', undefined)
      const confirm = vi.fn().mockReturnValue(true)
      vi.stubGlobal('confirm', confirm)
      setup()

      await screen.findByText('Crew Süd')
      fireEvent.click(within(passwordItem('Crew Süd')).getByRole('button', { name: 'Löschen' }))

      expect(confirm).toHaveBeenCalledWith('Passwort „Crew Süd“ löschen? 1 Gerät angemeldet, sie werden abgemeldet.')
      await waitFor(() => expect(fakeApi.calls('DELETE', '/api/admin/access-passwords/2')).toHaveLength(1))
    })
  })
})
