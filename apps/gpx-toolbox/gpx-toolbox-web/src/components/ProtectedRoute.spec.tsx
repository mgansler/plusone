import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '../lib/auth-context'

import { ProtectedRoute } from './ProtectedRoute'

vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => <p>Weiterleitung nach {to}</p>,
}))
vi.mock('../lib/auth-context', () => ({ useAuth: vi.fn() }))

function mockAuth(state: { isAuthenticated: boolean; isLoading: boolean }) {
  vi.mocked(useAuth).mockReturnValue(state as ReturnType<typeof useAuth>)
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/routes')
  })

  it('shows a spinner while the auth status is checked', () => {
    mockAuth({ isAuthenticated: false, isLoading: true })
    render(<ProtectedRoute>Inhalt</ProtectedRoute>)

    expect(screen.queryByText('Inhalt')).toBeNull()
    expect(screen.queryByText(/Weiterleitung/)).toBeNull()
  })

  it('redirects to the login when not authenticated', () => {
    mockAuth({ isAuthenticated: false, isLoading: false })
    render(<ProtectedRoute>Inhalt</ProtectedRoute>)

    expect(screen.getByText('Weiterleitung nach /login')).toBeTruthy()
    expect(screen.queryByText('Inhalt')).toBeNull()
  })

  it.each(['/callback', '/login', '/datenschutz', '/impressum'])(
    'renders the public route %s without login',
    (path) => {
      window.history.replaceState(null, '', path)
      mockAuth({ isAuthenticated: false, isLoading: false })
      render(<ProtectedRoute>Inhalt</ProtectedRoute>)

      expect(screen.getByText('Inhalt')).toBeTruthy()
    },
  )

  it('renders the content when authenticated', () => {
    mockAuth({ isAuthenticated: true, isLoading: false })
    render(<ProtectedRoute>Inhalt</ProtectedRoute>)

    expect(screen.getByText('Inhalt')).toBeTruthy()
  })
})
