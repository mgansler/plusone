import { CssBaseline, GlobalStyles } from '@mui/material'
import type { AxiosError } from '@nestjs/terminus/dist/errors/axios.error'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AUTHENTICATION_LOCAL_STORAGE_KEY } from '@plusone/feeds/api-client'
import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

import { App } from './app/app'
import { AppVersion } from './app/components/app-version'
import { UserContextProvider } from './app/context/user'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: 30_000,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta.name === 'fetch-profile' && (error as AxiosError).response?.status === 401) {
        localStorage.removeItem(AUTHENTICATION_LOCAL_STORAGE_KEY)
        queryClient.clear()
      }
    },
  }),
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <DarkModeThemeProvider>
      <CssBaseline />
      <GlobalStyles styles={{ '#root': { height: '100vh', display: 'flex', flexDirection: 'column' } }} />
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UserContextProvider>
            <AppVersion />
            <App />
          </UserContextProvider>
          {typeof window['Cypress'] === 'undefined' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </BrowserRouter>
    </DarkModeThemeProvider>
  </StrictMode>,
)
