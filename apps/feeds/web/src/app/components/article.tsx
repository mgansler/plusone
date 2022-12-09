import { CheckBoxOutlineBlank, CheckBoxOutlined, OpenInNew } from '@mui/icons-material'
import { Card, CardContent, CardHeader, IconButton } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

import { getFindArticlesQueryKey, getGetUserFeedsQueryKey, useToggleUnread } from '@plusone/feeds/api-client'
import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'

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
  selectedArticle: string
  scrollTargetRef?: RefObject<HTMLDivElement | undefined>
}

export function Article({ article: { article, unread }, selectedArticle, scrollTargetRef }: ArticleProps) {
  const { expandContent } = useFeedSettingsContext()
  const [showContent, setShowContent] = useState<boolean>(expandContent)

  useEffect(() => setShowContent(expandContent), [expandContent])

  const toggleUnread = useToggleUnreadState(article.id, unread)

  const color = selectedArticle === article.id ? 'primary' : 'inherit'

  return (
    <article>
      <Card ref={scrollTargetRef}>
        <CardHeader
          avatar={
            <IconButton onClick={() => toggleUnread()}>
              {unread ? <CheckBoxOutlineBlank color={color} /> : <CheckBoxOutlined color={color} />}
            </IconButton>
          }
          title={article.title}
          action={
            <IconButton target={'_blank'} href={article.link} onClick={() => toggleUnread(true)}>
              <OpenInNew />
            </IconButton>
          }
        />
        {showContent && (
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: article.contentBody }} />
          </CardContent>
        )}
      </Card>
    </article>
  )
}
