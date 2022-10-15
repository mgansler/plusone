import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'

type UserContextValue = {
  userInfo?: UserResponse
  auth?: LoginResponse
  isLoggedIn: boolean
  login: (auth: LoginResponse) => void
  logout: () => void
}

const userContext = createContext<UserContextValue | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'feeds_access_token'

type UserContextProviderProps = {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserResponse | undefined>()
  const [auth, setAuth] = useState<LoginResponse | undefined>(() => {
    const localStorageAuth = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')
    if (localStorageAuth.access_token) {
      return localStorageAuth
    }
    return undefined
  })

  useQuery<UserResponse>(
    ['user-info'],
    () =>
      fetch('/api/authentication/profile', {
        headers: {
          Authorization: `Bearer ${auth!.access_token}`,
        },
      }).then((res) => res.json()),
    {
      enabled: auth !== undefined,
      onSuccess: (data) => {
        setUserInfo(data)
        data.isAdmin ? navigate('/admin') : navigate('/member')
      },
    },
  )

  const isLoggedIn = userInfo != undefined

  const login = (auth: LoginResponse) => {
    setAuth(auth)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(auth))
  }

  const logout = () => {
    setAuth(undefined)
    setUserInfo(undefined)
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    navigate('/login')
  }

  return <userContext.Provider value={{ userInfo, auth, isLoggedIn, login, logout }}>{children}</userContext.Provider>
}

export function useUserContext() {
  const context = useContext(userContext)

  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}
