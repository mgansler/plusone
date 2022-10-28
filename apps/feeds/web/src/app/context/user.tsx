import type { AxiosError } from '@nestjs/terminus/dist/errors/axios.error'
import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'
import { AUTHENTICATION_LOCAL_STORAGE_KEY, useLogout, useProfile } from '@plusone/feeds/api-client'

type UserContextValue = {
  userInfo?: UserResponse
  isLoggedIn: boolean
  login: (auth: LoginResponse) => void
  logout: () => void
}

const UserContext = createContext<UserContextValue>(undefined)

type UserContextProviderProps = {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userInfo, setUserInfo] = useState<UserResponse | undefined>()
  const queryClient = useQueryClient()

  const { refetch: fetchProfile } = useProfile({
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

  const { refetch: logoutAddServer } = useLogout({ query: { enabled: false } })

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

  return <UserContext.Provider children={children} value={{ userInfo, isLoggedIn, login, logout }} />
}

export function useUserContext() {
  const context = useContext(UserContext)

  if (typeof context === 'undefined') {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}
