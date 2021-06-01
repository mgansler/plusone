import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import { createMuiTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@material-ui/core'
import React, { useMemo } from 'react'

import { App } from './app/app'
import { OctokitProvider } from './app/octokit-provider/octokit-provider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
})

function ThemedApp() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () => createMuiTheme({ palette: { type: prefersDarkMode ? 'dark' : 'light' } }),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <OctokitProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </OctokitProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

ReactDOM.render(<ThemedApp />, document.getElementById('root'))
