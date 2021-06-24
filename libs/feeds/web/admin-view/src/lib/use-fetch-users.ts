import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'
import { UserResponse } from '@plusone/feeds/shared/types'

export function useFetchUsers() {
  const token = useToken()
  return useQuery<UserResponse[]>('users', () =>
    fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(jsonOrThrow),
  )
}
