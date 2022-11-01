import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'
import { getFindArticlesQueryKey, getGetUserFeedsQueryKey, useToggleUnread } from '@plusone/feeds/api-client'

import { useFeedSettingsContext } from '../context/feed-settings'

function useToggleUnreadState(id: ArticleDto['id'], unread: boolean) {
  const queryClient = useQueryClient()
  const { mutate } = useToggleUnread({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getFindArticlesQueryKey())
        await queryClient.invalidateQueries(getGetUserFeedsQueryKey())
      },
    },
  })

  return (read?: boolean) => mutate({ id, data: { unread: typeof read !== 'undefined' ? !read : !unread } })
}

type ArticleProps = {
  article: ArticleResponseDto
}

export function Article({ article: { article, unread } }: ArticleProps) {
  const { expandContent } = useFeedSettingsContext()
  const [showContent, setShowContent] = useState<boolean>(expandContent)

  const toggleUnread = useToggleUnreadState(article.id, unread)

  return (
    <article>
      <input type={'checkbox'} checked={!unread} onChange={() => toggleUnread()} />
      {article.contentBody !== null && (
        <button onClick={() => setShowContent((cur) => !cur)}>{showContent ? 'collapse' : 'expand'}</button>
      )}
      <a href={article.link} target={'_blank'} rel={'noreferrer'} onClick={() => toggleUnread(true)}>
        {article.title}
      </a>
      {showContent && <div dangerouslySetInnerHTML={{ __html: article.contentBody }} />}
    </article>
  )
}
