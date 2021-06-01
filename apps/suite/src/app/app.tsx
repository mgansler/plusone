import { lazy, Suspense, useMemo } from 'react'
import { Route, Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Breadcrumbs,
  Toolbar,
  Link,
  CssBaseline,
  createMuiTheme,
  ThemeProvider,
  useMediaQuery,
} from '@material-ui/core'

const DinnerPlan = lazy(() => import('@plusone/dinner-plan'))

export function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () => createMuiTheme({ palette: { type: prefersDarkMode ? 'dark' : 'light' } }),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  )
}
