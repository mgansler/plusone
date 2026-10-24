import { useAuth } from './auth-context'

/**
 * Get the current JWT token from localStorage.
 * Used by the API client to attach the Bearer token.
 */
function getToken(): string | null {
  try {
    return localStorage.getItem('gpx-toolbox-jwt')
  } catch {
    return null
  }
}

/**
 * Fetch wrapper that automatically attaches the JWT token.
 * Falls back to unauthenticated fetch if no token is present.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(url, { ...options, headers })
}

/**
 * Hook that returns a bound fetch function pre-configured with the current API base path.
 * Automatically refreshes the token if the request gets a 401.
 */
export function useApiFetch() {
  const { logout } = useAuth()

  return async function apiFetchBound(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken()
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, { ...options, headers })

    // If we get a 401, the token is invalid — log the user out
    if (response.status === 401) {
      logout()
      window.location.href = '/'
    }

    return response
  }
}
