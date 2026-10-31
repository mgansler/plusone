import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { getGetSessionQueryKey } from '@plusone/trailcare-api-client'

export function createQueryClient(): QueryClient {
  /** A 401 means the session ended (logout elsewhere, rotated password): back to the login */
  const handleUnauthorized = (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.startsWith('/api/auth/')) {
      queryClient.setQueryData(getGetSessionQueryKey(), { authenticated: false })
    }
  }

  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: false,
        staleTime: 30_000,
      },
    },
  })
  return queryClient
}
