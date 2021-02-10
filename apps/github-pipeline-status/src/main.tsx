import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './app/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { OctokitProvider } from './app/octokit-provider/octokit-provider'

const queryClient = new QueryClient()

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <OctokitProvider>
        <App />
      </OctokitProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
