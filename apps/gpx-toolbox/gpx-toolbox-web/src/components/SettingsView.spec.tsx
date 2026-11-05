import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '../lib/auth-context'

import { SettingsView } from './SettingsView'

vi.mock('../lib/auth-context', () => ({ useAuth: vi.fn() }))

function mockAuth(user: Partial<NonNullable<ReturnType<typeof useAuth>['user']>> | null = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: !!user,
    isLoading: false,
    user: user && {
      id: 'u1',
      name: 'Martin',
      email: 'martin@example.com',
      avatarUrl: null,
      ...user,
    },
    token: 'jwt-1',
    login: vi.fn(),
    logout: vi.fn(),
  })
}

describe('SettingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth()
  })

  it('shows the account', () => {
    render(<SettingsView />)

    expect(screen.getByText('Martin')).toBeTruthy()
    expect(screen.getByText('martin@example.com')).toBeTruthy()
  })

  it('shows the initial of a user without avatar and without email', () => {
    mockAuth({ name: 'martin', email: null })
    render(<SettingsView />)

    expect(screen.getByText('M')).toBeTruthy()
    expect(screen.queryByText('martin@example.com')).toBeNull()
  })

  it('links the privacy policy', () => {
    render(<SettingsView />)

    expect(screen.getByRole('link', { name: 'Datenschutzerklärung' }).getAttribute('href')).toBe('/datenschutz')
  })

  it('links the imprint', () => {
    render(<SettingsView />)

    expect(screen.getByRole('link', { name: 'Impressum' }).getAttribute('href')).toBe('/impressum')
  })

  it('renders nothing without user', () => {
    mockAuth(null)
    const { container } = render(<SettingsView />)

    expect(container.innerHTML).toBe('')
  })
})
