import { AppBar, createStyles, makeStyles, Toolbar, Typography } from '@material-ui/core'
import React from 'react'

import { UserInfo } from './user-info/user-info'
import { Organizations } from './organizations/organizations'

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: {
      gap: theme.spacing(1),
    },
    title: {
      flexGrow: 1,
    },
    main: {
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
      height: '100vh',
    },
  }),
)

export function App() {
  const classNames = useStyles()
  return (
    <React.Fragment>
      <AppBar position={'static'}>
        <Toolbar className={classNames.toolbar}>
          <Typography variant={'h6'} className={classNames.title}>
            GitHub Pipeline Status
          </Typography>
          <UserInfo />
        </Toolbar>
      </AppBar>
      <main className={classNames.main}>
        <Organizations />
      </main>
    </React.Fragment>
  )
}
