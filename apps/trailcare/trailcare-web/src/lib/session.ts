import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getGetSessionQueryKey, logout, Role, useGetSession } from '@plusone/trailcare-api-client'

export function useSession() {
  const { data, isLoading, isError, refetch } = useGetSession({ query: { staleTime: 5 * 60_000 } })
  return {
    isLoading,
    /** The server could not be reached, this is not the same as being logged out */
    isUnavailable: isError && !data,
    retry: refetch,
    isAuthenticated: data?.authenticated === true,
    isAdmin: data?.role === Role.ADMIN,
  }
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useCallback(async () => {
    await logout()
    const sessionKey = getGetSessionQueryKey()
    queryClient.setQueryData(sessionKey, { authenticated: false })
    // Drop cached trail data, but keep the session query the app is subscribed to
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKey[0] })
  }, [queryClient])
}
