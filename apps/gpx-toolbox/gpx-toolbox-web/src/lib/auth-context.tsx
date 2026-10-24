import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

/** User profile returned from the auth status endpoint. */
export interface UserProfile {
  id: string
  stravaId: string
  name: string | null
  avatarUrl: string | null
}

/** Response from GET /api/auth/status. */
interface AuthStatusResponse {
  authenticated: boolean
  user?: UserProfile | null
}

const TOKEN_KEY = 'gpx-toolbox-jwt'
const STATUS_URL = '/api/auth/status'

interface AuthContextValue {
  /** Whether the user is authenticated. */
  isAuthenticated: boolean
  /** Current user profile, or null. */
  user: UserProfile | null
  /** The JWT token string, or null. */
  token: string | null
  /** Redirect to Strava OAuth. */
  login: () => void
  /** Clear token and user state. */
  logout: () => void
  /** Whether the auth status is still being checked. */
  isLoading: boolean
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage unavailable — ignore
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
})

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status on mount and when token changes
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    fetch(STATUS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Auth check failed')
        return res.json() as Promise<AuthStatusResponse>
      })
      .then((data) => {
        if (cancelled) return
        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          // Token invalid — clear it
          clearToken()
          setTokenState(null)
          setUser(null)
        }
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setTokenState(null)
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(() => {
    window.location.href = '/api/auth/strava'
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    user,
    token,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Extract the JWT token from the current URL hash fragment.
 * Called by the callback route after Strava OAuth redirect.
 */
export function extractTokenFromHash(): string | null {
  const hash = window.location.hash
  const match = hash.match(/token=([^&#]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Save the token from the OAuth callback and clear the hash.
 */
export function handleOAuthCallback(): boolean {
  const token = extractTokenFromHash()
  if (token) {
    setToken(token)
    // Clear the hash so the URL is clean
    history.replaceState(null, '', window.location.pathname)
    return true
  }
  return false
}
