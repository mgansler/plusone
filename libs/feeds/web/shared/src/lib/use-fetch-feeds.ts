import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'

interface Feed {
  originalTitle?: string
  title: string
  feedUrl: string
}

export function useFetchFeeds() {
  const token = useToken()
  return useQuery<Feed[]>('feeds', () =>
    fetch('/api/feed', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.ok) return res.json()

      throw new Error(`${res.status}: ${res.statusText}`)
    }),
  )
}
