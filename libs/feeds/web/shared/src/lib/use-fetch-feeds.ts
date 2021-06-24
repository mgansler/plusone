import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'

import { jsonOrThrow } from './json-or-throw'

export interface Feed {
  id: string
  originalTitle: string
  title?: string
  feedUrl: string
}

export function useFetchFeeds() {
  const token = useToken()
  return useQuery<Feed[]>('feeds', () =>
    fetch('/api/feed', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(jsonOrThrow),
  )
}
