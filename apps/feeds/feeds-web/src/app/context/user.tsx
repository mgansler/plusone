import type { AxiosError } from '@nestjs/terminus/dist/errors/axios.error'
import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AUTHENTICATION_LOCAL_STORAGE_KEY, useLogout, useProfile } from '@plusone/feeds/api-client'
import type { LoginResponseDto, UserResponseDto } from '@plusone/feeds/api-client'

type UserContextValue = {
  userInfo?: UserResponseDto
  isLoggedIn: boolean
  login: (auth: LoginResponseDto) => void
  logout: () => void
}

const UserContext = createContext<UserContextValue>(undefined)

type UserContextProviderProps = {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register'

  const {
    data: profile,
    refetch: fetchProfile,
    error: profileError,
  } = useProfile({
    query: {
      enabled: !isLoginOrRegister,
      refetchInterval: 30_000,
      meta: {
        name: 'fetch-profile',
      },
    },
  })

  useEffect(() => {
    if ((profileError as Error)?.message === 'Unauthorized' && !isLoginOrRegister) {
      navigate('/login')
    }
  }, [isLoginOrRegister, navigate, profileError])

  const { refetch: logoutAddServer } = useLogout({ query: { enabled: false } })
  const isLoggedIn = profile !== undefined

  const login = async (auth: LoginResponseDto) => {
    localStorage.setItem(AUTHENTICATION_LOCAL_STORAGE_KEY, JSON.stringify(auth))
    try {
      const response = await fetchProfile()
      navigate(response.data.isAdmin ? '/admin' : '/member/feeds')
    } catch (error) {
      if ((error as AxiosError).response?.status === 401) {
        console.error('You are not authorized.')
      }
    }
  }

  const logout = async () => {
    // Remove access and refresh tokens
    await logoutAddServer()
    localStorage.removeItem(AUTHENTICATION_LOCAL_STORAGE_KEY)
    // Clear local state
    queryClient.clear()
    // Finally redirect to the login page
    navigate('/login')
  }

  return <UserContext.Provider children={children} value={{ userInfo: profile, isLoggedIn, login, logout }} />
}

export function useUserContext() {
  const context = useContext(UserContext)

  if (typeof context === 'undefined') {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}
