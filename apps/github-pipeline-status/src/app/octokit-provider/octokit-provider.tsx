import React, { useContext, useMemo, useRef } from 'react'
import { Octokit } from '@octokit/core'
import { useLocalStorage } from '@plusone/hooks'
import { Input } from '@plusone/input'
import { createUseStyles } from 'react-jss'

interface Context {
  octokit: Octokit
  logout: () => void
}

const OctokitContext = React.createContext<Context>(null)

const useTokenInputStyles = createUseStyles({
  description: {
    margin: '4em auto',
    width: '24em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
})

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
    <React.Fragment>
      <section className={classNames.description}>
        <p>
          In order to use this application you need to provide an access token
          with the following permissions:
        </p>

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
      </section>

      <form onSubmit={handleSubmit} className={classNames.form}>
        <Input
          label={'Personal Access Token'}
          type={'password'}
          inputRef={inputRef}
        />
        <input type={'submit'} value={'save'} />
      </form>
    </React.Fragment>
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
