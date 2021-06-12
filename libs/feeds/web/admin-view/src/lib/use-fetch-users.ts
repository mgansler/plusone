import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'

interface User {
  id: string
  username: string
  email: string | null
  isAdmin: boolean
}

export function useFetchUsers() {
  const token = useToken()
  return useQuery<User[]>('users', () =>
    fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.ok) return res.json()

      throw new Error(`${res.status}: ${res.statusText}`)
    }),
  )
}
