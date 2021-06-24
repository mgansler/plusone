import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'

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
    }).then(jsonOrThrow),
  )
}
