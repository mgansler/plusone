import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@material-ui/core'

import { App } from './app/app'
import { OctokitProvider } from './app/octokit-provider/octokit-provider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
})

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <OctokitProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OctokitProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
