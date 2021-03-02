import React from 'react'
import {
  AppBar,
  createStyles,
  makeStyles,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core'

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

export const App: React.FC = () => {
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
      <Paper component={'main'} className={classNames.main}>
        <Organizations />
      </Paper>
    </React.Fragment>
  )
}
