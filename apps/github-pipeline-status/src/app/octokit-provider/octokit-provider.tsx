import React, { useContext, useMemo, useRef } from 'react'
import { Octokit } from '@octokit/core'
import { useLocalStorage } from '@plusone/hooks'
import {
  Button,
  createStyles,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core'
import { LoginCard } from '@plusone/components'

interface Context {
  octokit: Octokit
  logout: () => void
}

const OctokitContext = React.createContext<Context>(null)

interface TokenInputProps {
  setToken: (value: string) => void
}

const TokenInput: React.FC<TokenInputProps> = ({ setToken }) => {
  const inputRef = useRef<HTMLInputElement>()

  const handleSubmit = () => {
    if (inputRef.current) {
      setToken(inputRef.current.value)
    }
  }

  return (
    <LoginCard>
      <Typography>
        In order to use this application you need to provide an access token
        with the following permissions:
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

export const OctokitProvider: React.FC = ({ children }) => {
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

  return (
    <OctokitContext.Provider value={{ octokit, logout: removeToken }}>
      {children}
    </OctokitContext.Provider>
  )
}

export const useOctokit = () => useContext<Context>(OctokitContext).octokit
export const useLogout = () => useContext<Context>(OctokitContext).logout
