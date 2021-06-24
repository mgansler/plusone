import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { Feed, jsonOrThrow } from '@plusone/feeds/web/shared'

interface Article {
  id: string
  title: string
  content: string
  contentBody: string
  guid: string
  link: string
}

export function useFetchArticlesByFeed(feedId: Feed['id']) {
  const token = useToken()
  return useQuery<{ article: Article; unread: boolean }[]>('articles', () =>
    fetch(`/api/feed/${feedId}?includeRead=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(jsonOrThrow),
  )
}
