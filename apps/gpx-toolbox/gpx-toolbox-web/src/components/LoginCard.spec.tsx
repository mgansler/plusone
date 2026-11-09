import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { useAuth } from '../lib/auth-context'
import translations from '../../public/locales/de/translation.json'

import { LoginCard } from './LoginCard'

vi.mock('../lib/auth-context', () => ({
  useAuth: vi.fn(),
  setTokenDirectly: vi.fn(),
}))

const login = vi.fn()

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    login,
    logout: vi.fn(),
    ...overrides,
  })
}

const originalLocation = window.location

function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, search },
  })
}

describe('LoginCard', () => {
  beforeAll(async () => {
    await i18n.use(initReactI18next).init({
      lng: 'de',
      fallbackLng: 'de',
      resources: { de: { translation: translations } },
      interpolation: { escapeValue: false },
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth()
    setSearch('')
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('starts the Google login', () => {
    render(<LoginCard />)

    fireEvent.click(screen.getByRole('button', { name: 'Mit Google anmelden' }))

    expect(login).toHaveBeenCalled()
  })

  it('tells what is stored about the user', () => {
    render(<LoginCard />)

    expect(screen.getByText(/Wir speichern deinen Namen, deine E-Mail-Adresse und dein Profilbild/)).toBeTruthy()
    expect(screen.queryByText(/nur lokal gespeichert/)).toBeNull()
  })

  it('links the privacy policy', () => {
    render(<LoginCard />)

    expect(screen.getByRole('link', { name: 'Datenschutzerklärung' }).getAttribute('href')).toBe('/datenschutz')
  })

  it('links the imprint', () => {
    render(<LoginCard />)

    expect(screen.getByRole('link', { name: 'Impressum' }).getAttribute('href')).toBe('/impressum')
  })

  it('shows no error on a fresh visit', () => {
    render(<LoginCard />)

    expect(screen.queryByText(/Anmeldung wurde abgebrochen|Anmeldung ist fehlgeschlagen/)).toBeNull()
  })

  it('explains a login the user declined on the Google page', () => {
    setSearch('?error=access_denied')
    render(<LoginCard />)

    expect(screen.getByText('Die Anmeldung wurde abgebrochen.')).toBeTruthy()
  })

  it('reports any other login error', () => {
    setSearch('?error=server_error')
    render(<LoginCard />)

    expect(screen.getByText('Die Anmeldung ist fehlgeschlagen.')).toBeTruthy()
  })

  it('greets a logged in user', () => {
    mockAuth({
      isAuthenticated: true,
      user: { id: 'u1', name: 'martin', email: null, avatarUrl: null },
    })
    render(<LoginCard />)

    expect(screen.getByText('Willkommen, martin!')).toBeTruthy()
    expect(screen.getByText('M')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Mit Google anmelden' })).toBeNull()
  })
})
