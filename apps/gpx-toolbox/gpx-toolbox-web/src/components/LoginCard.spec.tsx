import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '../lib/auth-context'

import { LoginCard } from './LoginCard'

vi.mock('../lib/auth-context', () => ({ useAuth: vi.fn() }))

const login = vi.fn()
const loginWithRefreshToken = vi.fn()

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    login,
    loginWithRefreshToken,
    logout: vi.fn(),
    ...overrides,
  })
}

function setHostname(hostname: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, hostname },
  })
}

const originalLocation = window.location

describe('LoginCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth()
    setHostname('localhost')
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('starts the Strava OAuth login', () => {
    render(<LoginCard />)

    fireEvent.click(screen.getByRole('button', { name: 'Connect with Strava' }))

    expect(login).toHaveBeenCalled()
  })

  it('offers the refresh token login only on localhost', () => {
    setHostname('gpx.martingansler.de')
    render(<LoginCard />)

    expect(screen.queryByPlaceholderText('Refresh Token eingeben')).toBeNull()
  })

  it('logs in with a trimmed refresh token', async () => {
    loginWithRefreshToken.mockReturnValue(new Promise(() => undefined))
    render(<LoginCard />)
    const submit = screen.getByRole('button', { name: 'Mit Token einloggen' }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)

    fireEvent.change(screen.getByPlaceholderText('Refresh Token eingeben'), { target: { value: '  r1  ' } })
    fireEvent.click(submit)

    expect(loginWithRefreshToken).toHaveBeenCalledWith('r1')
    expect(await screen.findByRole('button', { name: 'Anmeldung...' })).toBeTruthy()
  })

  it('shows the error of a failed refresh token login and allows a retry', async () => {
    loginWithRefreshToken.mockRejectedValue(new Error('Authentication failed'))
    render(<LoginCard />)

    fireEvent.change(screen.getByPlaceholderText('Refresh Token eingeben'), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Mit Token einloggen' }))

    expect(await screen.findByText('Authentication failed')).toBeTruthy()
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Mit Token einloggen' }) as HTMLButtonElement).disabled).toBe(false),
    )
  })

  it('greets a logged in user', () => {
    mockAuth({ isAuthenticated: true, user: { id: 'u1', stravaId: '42', name: 'martin', avatarUrl: null } })
    render(<LoginCard />)

    expect(screen.getByText('Willkommen, martin!')).toBeTruthy()
    expect(screen.getByText('M')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Connect with Strava' })).toBeNull()
  })
})
