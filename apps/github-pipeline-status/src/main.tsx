import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core'

import { App } from './app/app'
import { OctokitProvider } from './app/octokit-provider/octokit-provider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
})

const theme = createMuiTheme({})

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <OctokitProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OctokitProvider>
    </ThemeProvider>
  </QueryClientProvider>,
  document.getElementById('root'),
)
