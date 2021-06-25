import { InfiniteData, useMutation, useQueryClient } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'
import { ArticleResponse, FeedResponse, Paginated, ToggleUnreadRequest } from '@plusone/feeds/shared/types'

export function useToggleUnread(feedId: FeedResponse['id'], articleId: ArticleResponse['article']['id']) {
  const token = useToken()
  const queryClient = useQueryClient()

  return useMutation(
    ['articles', feedId],
    (variables: ToggleUnreadRequest) =>
      fetch(`/api/article/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(variables),
      }).then(jsonOrThrow),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['articles', feedId], (input) => {
          for (const page of (input as InfiniteData<Paginated<ArticleResponse>>).pages) {
            for (const articleResponse of page.content) {
              if (articleResponse.article.id === articleId) {
                articleResponse.unread = data.unread
              }
            }
          }

          return input
        })
      },
    },
  )
}
