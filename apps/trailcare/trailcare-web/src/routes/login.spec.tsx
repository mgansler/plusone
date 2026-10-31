import { fireEvent, screen, waitFor } from '@testing-library/react'

import { fakeApi, httpError } from '../test/fake-api'
import { AREAS, LOGGED_OUT, USER } from '../test/fixtures'
import { renderApp } from '../test/render-app'

async function submitPassword(password: string) {
  fireEvent.change(await screen.findByLabelText('Passwort'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }))
}

describe('login page', () => {
  beforeEach(() => {
    fakeApi.on('GET', '/api/auth/session', LOGGED_OUT).on('GET', '/api/trail-areas', AREAS)
  })

  it('cannot be submitted without a password', async () => {
    renderApp('/login')
    expect((await screen.findByRole<HTMLButtonElement>('button', { name: 'Anmelden' })).disabled).toBe(true)
  })

  it('logs in and opens the trail list', async () => {
    fakeApi.on('POST', '/api/auth/login', USER)
    const { router } = renderApp('/login')

    await submitPassword('crew-passwort')

    expect(await screen.findByText('Klabuster')).toBeTruthy()
    expect(router.state.location.pathname).toBe('/')
    expect(fakeApi.bodies('POST', '/api/auth/login')).toEqual([{ password: 'crew-passwort' }])
  })

  it.each([
    [401, 'Das Passwort stimmt nicht.'],
    [429, 'Zu viele Versuche. Warte eine Minute und probier es dann nochmal.'],
  ])('explains a %i', async (status, message) => {
    fakeApi.on('POST', '/api/auth/login', () => {
      throw httpError(status, undefined, '/api/auth/login')
    })
    renderApp('/login')

    await submitPassword('falsch')

    expect((await screen.findByRole('alert')).textContent).toBe(message)
    expect(screen.getByLabelText('Passwort')).toBeTruthy()
  })

  it('stays on the login page after a wrong password', async () => {
    fakeApi.on('POST', '/api/auth/login', () => {
      throw httpError(401, 'Falsches Passwort', '/api/auth/login')
    })
    const { router } = renderApp('/login')

    await submitPassword('falsch')

    await screen.findByRole('alert')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })
})
