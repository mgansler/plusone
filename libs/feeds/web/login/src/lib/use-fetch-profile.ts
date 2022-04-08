import { useQuery } from 'react-query'

import type { User } from './types'

interface UseFetchProfileProps {
  token: string
  setToken: (newToken: string) => void
}

export function useFetchProfile({ token, setToken }: UseFetchProfileProps) {
  return useQuery<User>(
    ['user'],
    () =>
      fetch('/api/authentication/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        if (res.ok) return res.json()

        setToken('')
        throw new Error(`${res.status}: ${res.statusText}`)
      }),
    {
      enabled: Boolean(token),
      refetchInterval: 30_000,
      refetchIntervalInBackground: true,
    },
  )
}
