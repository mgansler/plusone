import React from 'react'
import { createUseStyles } from 'react-jss'

import { UserInfo } from './user-info/user-info'
import { Organizations } from './organizations/organizations'

const useGlobalStyles = createUseStyles({
  '@global': {
    '*': {
      margin: 0,
    },
    body: {
      height: '100vh',
      width: '100vw',
    },
  },
})

const useAppStyles = createUseStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 8,
  },
  main: {
    padding: 8,
  },
})

export const App: React.FC = () => {
  useGlobalStyles()
  const classNames = useAppStyles()
  return (
    <React.Fragment>
      <header className={classNames.header}>
        <h1>GitHub Pipeline Status</h1>
        <UserInfo />
      </header>
      <main className={classNames.main}>
        <Organizations />
      </main>
    </React.Fragment>
  )
}
