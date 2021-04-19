import { CircularProgress } from '@material-ui/core'
import { createContext, ReactNode, useEffect } from 'react'
import { useQuery } from 'react-apollo'

import { Login, LoginQuery, LoginQueryVariables, Me, MeQuery } from '@plusone/feeds-schema'
import { useBoolean } from '@plusone/hooks'

import { LoginPage } from './LoginPage'
import { useAuthenticationStyles } from './styles'
import { clearToken, readToken, writeToken } from './tokens'

interface Authentication {
  isAuthenticated: boolean
  logout: () => void
}

export const AuthenticationContext = createContext<Authentication>({
  isAuthenticated: false,
  logout: () => undefined,
})

type AuthenticationProviderProps = {
  children: ReactNode
}

export function AuthenticationProvider({ children }: AuthenticationProviderProps) {
  const classNames = useAuthenticationStyles()
  const [isAuthenticated, login, logout] = useBoolean(false)

  const code = new URLSearchParams(window.location.search).get('code') || ''
  const { loading: loginInProgress, data } = useQuery<LoginQuery, LoginQueryVariables>(Login, {
    skip: code === '',
    variables: { code },
  })

  useEffect(() => {
    if (data?.login) {
      const { __typename, ...token } = data.login
      writeToken(token)
      login()
      window.history.replaceState({}, '', window.location.origin + window.location.pathname)
    }
  }, [data, login])

  const { loading: loadingUserData, data: userData } = useQuery<MeQuery>(Me, {
    skip: !readToken(),
  })

  useEffect(() => {
    if (userData) {
      login()
    }
  }, [userData, login])

  const handleLogout = () => {
    clearToken()
    logout()
  }

  if (loginInProgress || loadingUserData || code !== '') {
    return <CircularProgress className={classNames.loading} />
  }

  return (
    <AuthenticationContext.Provider value={{ isAuthenticated, logout: handleLogout }}>
      {isAuthenticated || userData ? children : <LoginPage />}
    </AuthenticationContext.Provider>
  )
}
