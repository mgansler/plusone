import { CheckBoxOutlineBlank, CheckBoxOutlined, OpenInNew, Star, StarOutline } from '@mui/icons-material'
import { Card, CardContent, CardHeader, Container, IconButton, useTheme } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

import {
  getFindArticlesQueryKey,
  getGetUserFeedsQueryKey,
  getRecentlyReadArticlesQueryKey,
  useStarArticle,
  useToggleUnread,
} from '@plusone/feeds/api-client'
import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'

import { useFeedSettingsContext } from '../context/feed-settings'

export function useReadArticle() {
  const queryClient = useQueryClient()
  const { mutateAsync } = useToggleUnread({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getFindArticlesQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getGetUserFeedsQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getRecentlyReadArticlesQueryKey() })
      },
    },
  })

  return useCallback(
    async (articleId: ArticleDto['id'], read: boolean) => await mutateAsync({ articleId, data: { unread: !read } }),
    [mutateAsync],
  )
}

function useMarkArticleStarred() {
  const queryClient = useQueryClient()
  const { mutateAsync } = useStarArticle({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getFindArticlesQueryKey() })
      },
    },
  })

  return useCallback(
    async (articleId: ArticleDto['id'], starred: boolean) => await mutateAsync({ articleId, data: { starred } }),
    [mutateAsync],
  )
}

function subheader({ date }: ArticleDto): string {
  const dateString = new Date(date).toLocaleString([], {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return dateString
}

type ArticleProps = {
  article: ArticleResponseDto
  selectedArticle: string
  scrollTargetRef?: RefObject<HTMLDivElement | undefined>
}

export function Article({ article: { article, unread, starred }, selectedArticle, scrollTargetRef }: ArticleProps) {
  const theme = useTheme()

  const { expandContent } = useFeedSettingsContext()
  const [showContent, setShowContent] = useState<boolean>(expandContent)

  useEffect(() => setShowContent(expandContent), [expandContent])

  const readArticle = useReadArticle()
  const starArticle = useMarkArticleStarred()

  const color = selectedArticle === article.id ? 'primary' : 'inherit'

  return (
    <article>
      <Card ref={scrollTargetRef}>
        <CardHeader
          avatar={
            <>
              <IconButton
                onClick={() => readArticle(article.id, unread)}
                aria-label={unread ? 'Mark read' : 'Mark unread'}
              >
                {unread ? <CheckBoxOutlineBlank color={color} /> : <CheckBoxOutlined color={color} />}
              </IconButton>
              <IconButton onClick={() => starArticle(article.id, !starred)} aria-label={starred ? 'Star' : 'Unstar'}>
                {starred ? <Star /> : <StarOutline />}
              </IconButton>
            </>
          }
          title={article.title}
          subheader={subheader(article)}
          action={
            <IconButton target={'_blank'} href={article.link} onClick={() => readArticle(article.id, true)}>
              <OpenInNew />
            </IconButton>
          }
        />
        {showContent && (
          <CardContent>
            <Container
              sx={{
                '& a': {
                  color: theme.palette.primary.main,
                },
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        )}
      </Card>
    </article>
  )
}
