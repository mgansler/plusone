import { Button, TextField, Typography } from '@mui/material'
import { Octokit } from '@octokit/core'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useRef } from 'react'

import { LoginCard } from '@plusone/components'
import { useLocalStorage } from '@plusone/hooks'

interface Context {
  octokit: Octokit
  logout: () => void
}

const OctokitContext = createContext<Context | undefined>(undefined)

interface TokenInputProps {
  setToken: (value: string) => void
}

function TokenInput({ setToken }: TokenInputProps) {
  const inputRef = useRef<HTMLInputElement>()

  const handleSubmit = () => {
    if (inputRef.current) {
      setToken(inputRef.current.value)
    }
  }

  return (
    <LoginCard>
      <Typography>
        In order to use this application you need to provide an access token with the following permissions:
      </Typography>

      <dl>
        <dt>
          <code>repo</code>
        </dt>
        <dd>Full control of private repositories</dd>

        <dt>
          <code>read:org</code>
        </dt>
        <dd>Read org and team membership, read org projects</dd>

        <dt>
          <code>read:user</code>
        </dt>
        <dd>Read ALL user profile data</dd>
      </dl>

      <form onSubmit={handleSubmit}>
        <TextField
          id={'personal-access-token'}
          fullWidth={true}
          label={'Personal Access Token'}
          type={'password'}
          inputRef={inputRef}
        />
        <Button type={'submit'} color={'primary'}>
          Save
        </Button>
      </form>
    </LoginCard>
  )
}

export function OctokitProvider({ children }: { children: ReactNode }) {
  const [token, setToken, removeToken] = useLocalStorage<string>({
    key: 'github-personal-access-token',
  })

  const octokit = useMemo(() => {
    return new Octokit({
      auth: token,
    })
  }, [token])

  if (!token) {
    return <TokenInput setToken={setToken} />
  }

  return <OctokitContext.Provider value={{ octokit, logout: removeToken }}>{children}</OctokitContext.Provider>
}

export function useOctokit() {
  const context = useContext(OctokitContext)

  if (typeof context === 'undefined') {
    throw new Error('useOctokit must be used within an OctokitProvider')
  }

  return context.octokit
}

export function useLogout() {
  const context = useContext(OctokitContext)

  if (typeof context === 'undefined') {
    throw new Error('useOctokit must be used within an OctokitProvider')
  }

  return context.logout
}
