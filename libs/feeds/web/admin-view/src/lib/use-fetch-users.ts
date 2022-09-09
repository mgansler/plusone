import { useQuery } from '@tanstack/react-query'

import type { UserResponse } from '@plusone/feeds/shared/types'
import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'

export function useFetchUsers() {
  const token = useToken()
  return useQuery<UserResponse[]>(['users'], () =>
    fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(jsonOrThrow),
  )
}
