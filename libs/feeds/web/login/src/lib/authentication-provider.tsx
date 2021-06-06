import { createContext, Dispatch, FormEventHandler, ReactNode, SetStateAction, useContext, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

import { FeedsWebLogin } from './feeds-web-login'

interface User {
  username: string
}

interface AuthenticationContext {
  user: User
  token: string
}

const Context = createContext<AuthenticationContext | null | undefined>(undefined)

interface AuthenticationProviderProps {
  children: ReactNode
}

function useFetchProfile(token: string): User | undefined {
  const { data: user } = useQuery<User>(
    'user',
    () =>
      fetch('/api/authentication/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => (res.ok ? res.json() : null)),
    {
      enabled: Boolean(token),
    },
  )
  return user
}

function useLogin(setToken: Dispatch<SetStateAction<string>>) {
  const { mutate: login } = useMutation<{ access_token: string }, unknown, { username: string; password: string }>(
    (vars) => {
      return fetch('/api/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      }).then((res) => (res.ok ? res.json() : null))
    },
    {
      onSuccess: ({ access_token }) => setToken(access_token),
    },
  )
  return login
}

export function AuthenticationProvider({ children }: AuthenticationProviderProps) {
  const [token, setToken] = useState<string>('')
  const user = useFetchProfile(token)
  const login = useLogin(setToken)

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const username = (event.currentTarget.elements.namedItem('username') as HTMLInputElement).value
    const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value

    login({ username, password })
  }

  if (!user) {
    return <FeedsWebLogin onSubmit={onSubmit} />
  }

  return <Context.Provider value={{ user, token }} children={children} />
}

export function useUser(): User {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useUser must be used within an AuthenticationProvider')
  }

  if (context?.user === undefined) {
    throw new Error('no User in AuthenticationContext, make sure the user is logged in')
  }

  return context.user
}

export function useToken(): string {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useToken must be used within an AuthenticationProvider')
  }

  if (!context?.token) {
    throw new Error('no token in AuthenticationContext, make sure the user is logged in')
  }

  return context.token
}
