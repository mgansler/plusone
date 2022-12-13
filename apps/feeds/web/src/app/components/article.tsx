import { CheckBoxOutlineBlank, CheckBoxOutlined, OpenInNew } from '@mui/icons-material'
import { Card, CardContent, CardHeader, IconButton } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

import {
  getFindArticlesQueryKey,
  getGetUserFeedsQueryKey,
  getRecentlyReadArticlesQueryKey,
  useToggleUnread,
} from '@plusone/feeds/api-client'
import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'

import { useFeedSettingsContext } from '../context/feed-settings'

export function useReadArticle() {
  const queryClient = useQueryClient()
  const { mutateAsync } = useToggleUnread({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getFindArticlesQueryKey())
        await queryClient.invalidateQueries(getGetUserFeedsQueryKey())
        await queryClient.invalidateQueries(getRecentlyReadArticlesQueryKey())
      },
    },
  })

  const readArticle = useCallback(
    async (id: ArticleDto['id'], read: boolean) =>
      await mutateAsync({
        id,
        data: { unread: !read },
      }),
    [mutateAsync],
  )

  return readArticle
}

type ArticleProps = {
  article: Omit<ArticleResponseDto, 'cursor'>
  selectedArticle: string
  scrollTargetRef?: RefObject<HTMLDivElement | undefined>
}

export function Article({ article: { article, unread }, selectedArticle, scrollTargetRef }: ArticleProps) {
  const { expandContent } = useFeedSettingsContext()
  const [showContent, setShowContent] = useState<boolean>(expandContent)

  useEffect(() => setShowContent(expandContent), [expandContent])

  const readArticle = useReadArticle()

  const color = selectedArticle === article.id ? 'primary' : 'inherit'

  return (
    <article>
      <Card ref={scrollTargetRef}>
        <CardHeader
          avatar={
            <IconButton onClick={() => readArticle(article.id, unread)}>
              {unread ? <CheckBoxOutlineBlank color={color} /> : <CheckBoxOutlined color={color} />}
            </IconButton>
          }
          title={article.title}
          action={
            <IconButton target={'_blank'} href={article.link} onClick={() => readArticle(article.id, true)}>
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
