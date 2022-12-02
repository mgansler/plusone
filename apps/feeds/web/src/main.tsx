import { CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

import { App } from './app/app'
import { UserContextProvider } from './app/context/user'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: 30_000,
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <DarkModeThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UserContextProvider>
            <App />
          </UserContextProvider>
          {typeof window['Cypress'] === 'undefined' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </BrowserRouter>
    </DarkModeThemeProvider>
  </StrictMode>,
)
