import React, { useContext, useMemo, useRef } from 'react'
import { Octokit } from '@octokit/core'
import { useLocalStorage } from '@plusone/hooks'
import {
  Button,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core'

interface Context {
  octokit: Octokit
  logout: () => void
}

const OctokitContext = React.createContext<Context>(null)

const useTokenInputStyles = makeStyles((theme) =>
  createStyles({
    card: {
      margin: '4rem auto',
      width: '30rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  }),
)

const TokenInput: React.FC<{
  setToken: (value: string) => void
}> = ({ setToken }) => {
  const classNames = useTokenInputStyles()

  const inputRef = useRef<HTMLInputElement>()

  const handleSubmit = () => {
    if (inputRef.current) {
      setToken(inputRef.current.value)
    }
  }

  return (
    <Card className={classNames.card}>
      <CardContent>
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
            fullWidth={true}
            label={'Personal Access Token'}
            type={'password'}
            inputRef={inputRef}
          />
          <Button type={'submit'} color={'primary'}>
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
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
