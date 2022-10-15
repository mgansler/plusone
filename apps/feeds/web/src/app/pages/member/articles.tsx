import { useQuery } from '@tanstack/react-query'

import type { FeedResponse, PaginatedArticles } from '@plusone/feeds/shared/types'

import { useQueryFn } from '../../util/api-client'

type ArticlesProps = {
  feedId: FeedResponse['id']
}

export function Articles({ feedId }: ArticlesProps) {
  const fetchArticlesQueryFn = useQueryFn(`/api/feed/`)
  const { data, isLoading } = useQuery<PaginatedArticles>(['feed', feedId], fetchArticlesQueryFn)

  if (isLoading) {
    return null
  }

  return (
    <div>
      total: {data!.totalCount} - unread: {data!.unreadCount}
    </div>
  )
}
