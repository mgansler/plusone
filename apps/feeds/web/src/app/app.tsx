import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthenticationProvider } from '@plusone/feeds/web/login'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        <h1>Welcome to web!</h1>
      </AuthenticationProvider>
    </QueryClientProvider>
  )
}
