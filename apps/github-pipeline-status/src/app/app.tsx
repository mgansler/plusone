import React from 'react'
import { createUseStyles } from 'react-jss'

import { UserInfo } from './user-info/user-info'
import { Organizations } from './organizations/organizations'

const useAppStyles = createUseStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 8,
  },
  main: {
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
})

export const App: React.FC = () => {
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
