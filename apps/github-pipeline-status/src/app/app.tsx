import { AppBar, CssBaseline, Theme, Toolbar, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

import { OctokitProvider } from './octokit-provider/octokit-provider'
import { Organizations } from './organizations/organizations'
import { UserInfo } from './user-info/user-info'

const useStyles = makeStyles<Theme>((theme) =>
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

export function AppWithProviders() {
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
})

export function App() {
  return (
    <DarkModeThemeProvider>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <OctokitProvider>
          <AppWithProviders />
        </OctokitProvider>
      </QueryClientProvider>
    </DarkModeThemeProvider>
  )
}
