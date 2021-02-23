import React, { useContext, useMemo, useRef } from 'react'
import { Octokit } from '@octokit/core'
import { useLocalStorage } from '@plusone/hooks'

interface Context {
  octokit: Octokit
  logout: () => void
}

const OctokitContext = React.createContext<Context>(null)

const TokenInput: React.FC<{
  setToken: (value: string) => void
}> = ({ setToken }) => {
  const inputRef = useRef<HTMLInputElement>()

  const handleSubmit = () => {
    if (inputRef.current) {
      setToken(inputRef.current.value)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Personal Access Token
        <input type={'password'} ref={inputRef} />
      </label>
      <input type={'submit'} value={'save'} />
    </form>
  )
}

export const OctokitProvider: React.FC = ({ children }) => {
  const [token, setToken, removeToken] = useLocalStorage<string>(
    'github-personal-access-token',
  )

  const octokit = useMemo(() => {
    return new Octokit({
      auth: token,
    })
  }, [token])

  if (!token) {
    return <TokenInput setToken={setToken} />
  }

  return (
    <OctokitContext.Provider value={{ octokit, logout: removeToken }}>
      {children}
    </OctokitContext.Provider>
  )
}

export const useOctokit = () => useContext<Context>(OctokitContext).octokit
export const useLogout = () => useContext<Context>(OctokitContext).logout
