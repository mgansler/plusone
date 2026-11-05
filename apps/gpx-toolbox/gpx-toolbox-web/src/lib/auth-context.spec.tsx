import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, extractTokenFromHash, handleOAuthCallback, useAuth } from './auth-context'

const TOKEN_KEY = 'gpx-toolbox-jwt'
const user = { id: 'u1', name: 'Martin', email: 'martin@example.com', avatarUrl: null }

/** Renders the auth state as text and exposes the actions */
function AuthState() {
  const auth = useAuth()
  return (
    <div>
      <p>{auth.isLoading ? 'lädt' : auth.isAuthenticated ? `angemeldet als ${auth.user?.name}` : 'abgemeldet'}</p>
      <p>token: {auth.token ?? '-'}</p>
      <button onClick={auth.logout}>Abmelden</button>
      <button onClick={auth.login}>Anmelden</button>
    </div>
  )
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthState />
    </AuthProvider>,
  )
}

function mockFetch(response: { ok: boolean; json?: () => Promise<unknown> } | Error) {
  const fetchMock =
    response instanceof Error ? vi.fn().mockRejectedValue(response) : vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('AuthProvider', () => {
  let locationHref: string
  const originalLocation = window.location

  beforeEach(() => {
    localStorage.clear()
    locationHref = ''
    // Capture redirects instead of navigating away
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        get href() {
          return locationHref
        },
        set href(value: string) {
          locationHref = value
        },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('is logged out without stored token and does not call the backend', async () => {
    const fetchMock = mockFetch({ ok: true })
    renderAuth()

    expect(await screen.findByText('abgemeldet')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('checks a stored token with the backend and loads the user', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1')
    const fetchMock = mockFetch({ ok: true, json: async () => ({ authenticated: true, user }) })
    renderAuth()

    expect(screen.getByText('lädt')).toBeTruthy()
    expect(await screen.findByText('angemeldet als Martin')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/status', { headers: { Authorization: 'Bearer jwt-1' } })
  })

  it.each([
    ['the backend rejects the token', { ok: true, json: async () => ({ authenticated: false }) }],
    ['the status request fails', { ok: false }],
    ['the backend is unreachable', new Error('offline')],
  ])('drops the stored token when %s', async (_, response) => {
    localStorage.setItem(TOKEN_KEY, 'expired')
    mockFetch(response)
    renderAuth()

    expect(await screen.findByText('abgemeldet')).toBeTruthy()
    expect(screen.getByText('token: -')).toBeTruthy()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('logs out', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1')
    mockFetch({ ok: true, json: async () => ({ authenticated: true, user }) })
    renderAuth()
    await screen.findByText('angemeldet als Martin')

    act(() => screen.getByText('Abmelden').click())

    expect(screen.getByText('abgemeldet')).toBeTruthy()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('starts the Google login by navigating to the backend', async () => {
    const fetchMock = mockFetch({ ok: true })
    renderAuth()
    await screen.findByText('abgemeldet')

    act(() => screen.getByText('Anmelden').click())

    expect(locationHref).toBe('/api/auth/google')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('OAuth callback', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('extracts the token from the URL fragment', () => {
    window.history.replaceState(null, '', '/#token=a.b.c')
    expect(extractTokenFromHash()).toBe('a.b.c')

    window.history.replaceState(null, '', '/#foo=1&token=a%2Eb&bar=2')
    expect(extractTokenFromHash()).toBe('a.b')

    window.history.replaceState(null, '', '/routes')
    expect(extractTokenFromHash()).toBeNull()
  })

  it('stores the token and removes it from the URL', () => {
    window.history.replaceState(null, '', '/#token=jwt-1')

    expect(handleOAuthCallback()).toBe(true)

    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1')
    expect(window.location.hash).toBe('')
  })

  it('does nothing without token', () => {
    window.history.replaceState(null, '', '/routes')

    expect(handleOAuthCallback()).toBe(false)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})
