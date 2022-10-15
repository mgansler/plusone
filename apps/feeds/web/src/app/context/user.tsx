import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { LoginResponse, UserResponse } from '@plusone/feeds/shared/types'

type UserContextValue = {
  userInfo?: UserResponse
  auth?: LoginResponse
  isLoggedIn: boolean
  setAuth: (auth: LoginResponse) => void
  logout: () => void
}

const userContext = createContext<UserContextValue | undefined>(undefined)

type UserContextProviderProps = {
  children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserResponse | undefined>()
  const [auth, setAuth] = useState<LoginResponse | undefined>()

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
        navigate('/member')
      },
    },
  )

  const isLoggedIn = userInfo != undefined

  const logout = () => {
    setAuth(undefined)
    setUserInfo(undefined)
    navigate('/login')
  }

  return <userContext.Provider value={{ userInfo, auth, isLoggedIn, setAuth, logout }}>{children}</userContext.Provider>
}

export function useUserContext() {
  const context = useContext(userContext)

  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider')
  }

  return context
}
