import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'

import { useLocalStorage } from '@plusone/hooks'

import { FeedsWebLogin } from './feeds-web-login'
import { useFetchProfile } from './use-fetch-profile'
import { Token, User } from './types'

interface AuthenticationContext {
  user?: User
  token: string
  logout: () => void
}

const Context = createContext<AuthenticationContext | undefined>(undefined)

interface AuthenticationProviderProps {
  children: ReactNode
}

export function AuthenticationProvider({ children }: AuthenticationProviderProps) {
  const [token = '', setToken] = useLocalStorage<Token>({ key: 'feeds-access-token', defaultValue: '' })
  const { data: user, isLoading, remove } = useFetchProfile({ token, setToken })
  // TODO: this is not really necessary
  const value = useMemo(() => ({ user, token, logout: () => setToken('') }), [setToken, token, user])

  useEffect(() => {
    if (token === '') {
      remove()
    }
  }, [remove, token])

  if (isLoading) {
    return null
  }

  if (!user || !token) {
    return <FeedsWebLogin setToken={setToken} />
  }

  return <Context.Provider value={value} children={children} />
}

export function useUser(): User {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useUser must be used within an AuthenticationProvider')
  }

  if (context.user === undefined) {
    throw new Error('no User in AuthenticationContext, make sure the user is logged in')
  }

  return context.user
}

export function useToken(): string {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useToken must be used within an AuthenticationProvider')
  }

  if (!context.token) {
    throw new Error('no token in AuthenticationContext, make sure the user is logged in')
  }

  return context.token
}

export function useLogout() {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useLogout must be used within an AuthenticationProvider')
  }

  return context.logout
}

export function MockAuthenticationProvider({
  children,
  token = 'fake_token',
  user = { username: 'user', isAdmin: false },
}: AuthenticationProviderProps & Partial<AuthenticationContext>) {
  return <Context.Provider value={{ token, user, logout: () => undefined }} children={children} />
}
