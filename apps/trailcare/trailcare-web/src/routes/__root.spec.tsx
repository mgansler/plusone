import { fireEvent, screen, waitFor } from '@testing-library/react'

import { fakeApi, httpError, networkError } from '../test/fake-api'
import { ADMIN, AREAS, LOGGED_OUT, USER } from '../test/fixtures'
import { renderApp } from '../test/render-app'

describe('access to the app', () => {
  beforeEach(() => {
    fakeApi.on('GET', '/api/trail-areas', AREAS)
  })

  it.each(['/', '/trails/1', '/admin'])('sends logged out visitors from %s to the login', async (path) => {
    fakeApi.on('GET', '/api/auth/session', LOGGED_OUT)
    const { router } = renderApp(path)

    expect(await screen.findByLabelText('Passwort')).toBeTruthy()
    expect(router.state.location.pathname).toBe('/login')
    expect(fakeApi.calls('GET', '/api/trail-areas')).toHaveLength(0)
  })

  it('sends logged in users away from the login', async () => {
    fakeApi.on('GET', '/api/auth/session', USER)
    const { router } = renderApp('/login')

    expect(await screen.findByText('Klabuster')).toBeTruthy()
    expect(router.state.location.pathname).toBe('/')
  })

  it('keeps users without admin role out of the admin area', async () => {
    fakeApi.on('GET', '/api/auth/session', USER)
    const { router } = renderApp('/admin')

    expect(await screen.findByText('Klabuster')).toBeTruthy()
    expect(router.state.location.pathname).toBe('/')
    expect(screen.queryByRole('link', { name: 'Verwaltung' })).toBeNull()
  })

  it('shows the admin link only to admins', async () => {
    fakeApi.on('GET', '/api/auth/session', ADMIN)
    renderApp('/')
    expect(await screen.findByRole('link', { name: 'Verwaltung' })).toBeTruthy()
  })

  it('does not mistake a missing connection for being logged out', async () => {
    let online = false
    fakeApi.on('GET', '/api/auth/session', () => {
      if (!online) throw networkError()
      return USER
    })
    renderApp('/')

    expect(await screen.findByText('Keine Verbindung zum Server. Bitte prüf deinen Empfang.')).toBeTruthy()
    expect(screen.queryByLabelText('Passwort')).toBeNull()

    online = true
    fireEvent.click(screen.getByRole('button', { name: 'Nochmal versuchen' }))
    expect(await screen.findByText('Klabuster')).toBeTruthy()
  })

  it('returns to the login when the session ends while using the app', async () => {
    fakeApi.on('GET', '/api/auth/session', USER).on('GET', '/api/trails/1', () => {
      throw httpError(401, undefined, '/api/trails/1')
    })
    fakeApi.on('GET', '/api/trails/1/care-entries', [])
    const { router } = renderApp('/trails/1')

    expect(await screen.findByLabelText('Passwort')).toBeTruthy()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('logs out', async () => {
    let session = USER
    fakeApi.on('GET', '/api/auth/session', () => session)
    fakeApi.on('POST', '/api/auth/logout', () => (session = LOGGED_OUT))
    const { router } = renderApp('/')

    fireEvent.click(await screen.findByRole('button', { name: 'Abmelden' }))

    expect(await screen.findByLabelText('Passwort')).toBeTruthy()
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(fakeApi.calls('POST', '/api/auth/logout')).toHaveLength(1)
  })
})
