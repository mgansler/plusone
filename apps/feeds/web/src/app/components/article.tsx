import { useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'

import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'
import {
  getArticleControllerSearchQueryKey,
  getFeedControllerGetQueryKey,
  useArticleControllerToggleUnread,
} from '@plusone/feeds/api-client'

function useToggleUnread(id: ArticleDto['id'], unread: boolean) {
  const { feedId } = useParams()
  const [searchParams] = useSearchParams()

  const queryClient = useQueryClient()
  const { mutate } = useArticleControllerToggleUnread({
    mutation: {
      onSuccess: async () => {
        const search = searchParams.get('search')
        if (search) {
          await queryClient.invalidateQueries(getArticleControllerSearchQueryKey({ s: search }))
        }
        if (feedId) {
          await queryClient.invalidateQueries(getFeedControllerGetQueryKey(feedId))
        }
      },
    },
  })

  return () => mutate({ id, data: { unread: !unread } })
}

type ArticleProps = {
  article: ArticleResponseDto
}

export function Article({ article: { article, unread } }: ArticleProps) {
  const toggleUnread = useToggleUnread(article.id, unread)

  return (
    <article>
      <input type={'checkbox'} defaultChecked={!unread} onClick={toggleUnread} />
      {article.title}
    </article>
  )
}
