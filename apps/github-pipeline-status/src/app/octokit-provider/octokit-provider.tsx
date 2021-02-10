import React, { useContext, useMemo, useRef } from 'react'
import { Octokit } from '@octokit/core'

const PERSONAL_ACCESS_TOKEN_LOCAL_STORAGE_KEY = 'github-personal-access-token'

interface Context {
  octokit: Octokit
  logout: () => void
}

const OctokitContext = React.createContext<Context>(null)

const TokenInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>()

  const handleSubmit = () => {
    if (inputRef.current) {
      localStorage.setItem(
        PERSONAL_ACCESS_TOKEN_LOCAL_STORAGE_KEY,
        inputRef.current.value,
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Personal Access Token
        <input type={'text'} ref={inputRef} />
      </label>
      <input type={'submit'} value={'save'} />
    </form>
  )
}

export const OctokitProvider: React.FC = ({ children }) => {
  const token = localStorage.getItem(PERSONAL_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

  const octokit = useMemo(() => {
    return new Octokit({
      auth: token,
    })
  }, [token])

  if (!token) {
    return <TokenInput />
  }

  const logout = () => {
    localStorage.removeItem(PERSONAL_ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  }

  return (
    <OctokitContext.Provider value={{ octokit, logout }}>
      {children}
    </OctokitContext.Provider>
  )
}

export const useOctokit = () => useContext<Context>(OctokitContext).octokit
export const useLogout = () => useContext<Context>(OctokitContext).logout
