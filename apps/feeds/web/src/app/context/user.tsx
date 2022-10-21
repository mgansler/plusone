import type { AxiosError } from '@nestjs/terminus/dist/errors/axios.error'
import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'
import {
  AUTHENTICATION_LOCAL_STORAGE_KEY,
  useAuthenticationControllerGetProfile,
  useAuthenticationControllerLogout,
} from '@plusone/feeds/api-client'

type UserContextValue = {
  userInfo?: UserResponse
  isLoggedIn: boolean
  login: (auth: LoginResponse) => void
  logout: () => void
}

const userContext = createContext<UserContextValue | undefined>(undefined)

type UserContextProviderProps = {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userInfo, setUserInfo] = useState<UserResponse | undefined>()
  const queryClient = useQueryClient()

  const { refetch: fetchProfile } = useAuthenticationControllerGetProfile({
    query: {
      enabled: location.pathname !== '/login',
      refetchInterval: 30_000,
      onSuccess: ({ data }) => {
        setUserInfo(data)
        if (location.pathname !== '/home') {
          // data.isAdmin ? navigate('/admin') : navigate('/member')
        }
      },
      onError: async (err) => {
        if ((err as AxiosError).response?.status === 401) {
          localStorage.removeItem(AUTHENTICATION_LOCAL_STORAGE_KEY)
          // Clear local state
          queryClient.clear()
          setUserInfo(undefined)
        }
      },
    },
  })

  const { refetch: logoutAddServer } = useAuthenticationControllerLogout({ query: { enabled: false } })

  const isLoggedIn = userInfo !== undefined

  const login = async (auth: LoginResponse) => {
    localStorage.setItem(AUTHENTICATION_LOCAL_STORAGE_KEY, JSON.stringify(auth))
    const { data } = await fetchProfile()
    if (data.data.isAdmin) {
      navigate('/admin')
    } else {
      navigate('/member/feeds')
    }
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
