import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'

import { getAuthorizationHeader } from '../util/api-client'

type UserContextValue = {
  userInfo?: UserResponse
  isLoggedIn: boolean
  login: (auth: LoginResponse) => void
  logout: () => void
}

const userContext = createContext<UserContextValue | undefined>(undefined)

export const AUTHENTICATION_LOCAL_STORAGE_KEY = 'feeds_auth'

type UserContextProviderProps = {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userInfo, setUserInfo] = useState<UserResponse | undefined>()
  const queryClient = useQueryClient()
  const auth = () => JSON.parse(localStorage.getItem(AUTHENTICATION_LOCAL_STORAGE_KEY) || '{}')

  const { refetch: refreshToken } = useQuery<LoginResponse>({
    queryKey: ['refresh'],
    queryFn: () =>
      fetch('/api/authentication/refresh', { headers: getAuthorizationHeader('refresh_token') }).then((res) =>
        res.json(),
      ),
    cacheTime: 0,
    enabled: false,
  })

  const { refetch: fetchProfile } = useQuery<UserResponse>(
    ['user-info'],
    () =>
      fetch('/api/authentication/profile', {
        headers: getAuthorizationHeader('access_token'),
      }).then(async (res) => {
        if (res.status === 200) {
          return res.json()
        }
        throw new Error((await res.json()).message)
      }),
    {
      refetchInterval: 30_000,
      enabled: Boolean(getAuthorizationHeader('access_token')),
      onSuccess: (data) => {
        setUserInfo(data)
        if (location.pathname !== '/home') {
          data.isAdmin ? navigate('/admin') : navigate('/member')
        }
      },
      onError: async (err) => {
        if ((err as Error).message === 'Unauthorized') {
          const refreshResponse = await refreshToken()
          if (refreshResponse) {
            localStorage.setItem(AUTHENTICATION_LOCAL_STORAGE_KEY, JSON.stringify(refreshResponse.data))
            await fetchProfile()
          }
        }
      },
    },
  )

  const { refetch: logoutAddServer } = useQuery({
    queryFn: () =>
      fetch('/api/authentication/logout', {
        headers: {
          Authorization: `Bearer ${auth().access_token}`,
        },
      }),
    enabled: false,
  })

  const isLoggedIn = userInfo !== undefined

  const login = async (auth: LoginResponse) => {
    localStorage.setItem(AUTHENTICATION_LOCAL_STORAGE_KEY, JSON.stringify(auth))
    await fetchProfile()
  }

  const logout = async () => {
    // Remove access and refresh tokens
    await logoutAddServer()
    localStorage.removeItem(AUTHENTICATION_LOCAL_STORAGE_KEY)
    // Clear local state
    queryClient.clear()
    setUserInfo(undefined)
    // Finally redirect to the login page
    navigate('/login')
  }

  return <userContext.Provider value={{ userInfo, isLoggedIn, login, logout }}>{children}</userContext.Provider>
}

export function useUserContext() {
  const context = useContext(userContext)

  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}
