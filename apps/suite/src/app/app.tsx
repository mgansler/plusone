import { lazy, Suspense } from 'react'
import { Link as RouterLink, Route } from 'react-router-dom'
import { AppBar, Breadcrumbs, CssBaseline, Link, Toolbar } from '@material-ui/core'

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
        <Route path={'/'} exact={true}>
          <div>Homepage</div>
        </Route>
        <Route path={'/dinner-plan'}>
          <Suspense fallback={<div>Loading...</div>}>
            <DinnerPlan />
          </Suspense>
        </Route>
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
