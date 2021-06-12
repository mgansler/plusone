import { AppBar, createStyles, CssBaseline, makeStyles, Toolbar, Typography } from '@material-ui/core'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

import { UserInfo } from './user-info/user-info'
import { Organizations } from './organizations/organizations'
import { OctokitProvider } from './octokit-provider/octokit-provider'

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

function AppWithProviders() {
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
