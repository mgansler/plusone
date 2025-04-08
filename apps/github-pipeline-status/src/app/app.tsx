import { AppBar, CssBaseline, Toolbar, Typography, useTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { Route, Routes } from 'react-router-dom'

import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

import { OctokitProvider } from './octokit-provider/octokit-provider'
import { Organizations } from './organizations/organizations'
import { OrganizationsBootstrap } from './organizations/organizations-bootstrap'
import { UserInfo } from './user-info/user-info'

export function AppWithProviders() {
  const theme = useTheme()

  return (
    <React.Fragment>
      <AppBar position={'static'}>
        <Toolbar
          sx={{
            gap: theme.spacing(1),
          }}
        >
          <Typography variant={'h6'} sx={{ flexGrow: 1 }}>
            GitHub Pipeline Status
          </Typography>
          <UserInfo />
        </Toolbar>
      </AppBar>

      <main
        style={{
          padding: theme.spacing(1),
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1),
          height: '100vh',
        }}
      >
        <Routes>
          <Route path={''} element={<OrganizationsBootstrap />} />
          <Route path={'/organization/:organizationName'} element={<Organizations />} />
        </Routes>
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
