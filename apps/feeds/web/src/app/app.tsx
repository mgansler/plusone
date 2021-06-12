import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthenticationProvider } from '@plusone/feeds/web/login'

import { Logout } from './logout'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        <h1>Welcome to web!</h1>
        <Logout />
      </AuthenticationProvider>
    </QueryClientProvider>
  )
}
