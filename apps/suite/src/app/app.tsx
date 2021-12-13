import { lazy, Suspense } from 'react'
import { Link as RouterLink, Route, Routes } from 'react-router-dom'
import { AppBar, Breadcrumbs, CssBaseline, Link, Toolbar } from '@mui/material'

import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

const DinnerPlan = lazy(() => import('@plusone/dinner-plan'))

function AppWithProviders() {
  return (
    <>
      <AppBar position={'static'}>
        <Toolbar>
          <Breadcrumbs separator={'›'}>
            <Link color={'textPrimary'} component={RouterLink} to={'/'}>
              Martin's App Suite
            </Link>
            <Link color={'textPrimary'} component={RouterLink} to={'/dinner-plan'}>
              Dinner Plan
            </Link>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>

      <main>
        <Routes>
          <Route path={'/'} element={<div>Homepage</div>} />
          <Route
            path={'/dinner-plan/*'}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <DinnerPlan />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </>
  )
}

export function App() {
  return (
    <DarkModeThemeProvider>
      <CssBaseline />
      <AppWithProviders />
    </DarkModeThemeProvider>
  )
}
