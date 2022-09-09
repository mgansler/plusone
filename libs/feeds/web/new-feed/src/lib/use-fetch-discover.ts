import { useQuery } from '@tanstack/react-query'

import type { DiscoverResponse } from '@plusone/feeds/shared/types'
import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'

export function useFetchDiscover(url: string) {
  const token = useToken()

  return useQuery<DiscoverResponse>(
    ['discover', url],
    () => {
      const params = new URLSearchParams({ url })
      return fetch(`/api/feed/discover?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(jsonOrThrow)
    },
    { enabled: url !== '' },
  )
}
