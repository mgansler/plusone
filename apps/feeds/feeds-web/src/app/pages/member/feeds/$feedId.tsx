import { Button, Stack } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  getFindArticlesInfiniteQueryKey,
  getGetUserFeedsQueryKey,
  useMarkArticlesRead,
  useValidatedFindArticlesInfinite,
} from '@plusone/feeds/api-client'

import { ArticleList } from '../../../components/article-list'
import { FeedSettingsBar } from '../../../components/feed-settings-bar'
import { SearchBar } from '../../../components/search-bar'
import { useFeedSettingsContext } from '../../../context/feed-settings'

export function Articles() {
  const { feedId } = useParams()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search')
  const { sort, includeRead } = useFeedSettingsContext()

  const queryClient = useQueryClient()

  const f = feedId === 'all' || feedId === 'starred' ? undefined : feedId
  const starred = feedId === 'starred' ? true : undefined

  const { data, hasNextPage, fetchNextPage } = useValidatedFindArticlesInfinite(
    { f, s: search, sort, r: includeRead, starred },
    {
      query: {
        getNextPageParam: (lastPage) => (lastPage.content.length < lastPage.pageSize ? undefined : lastPage.lastCursor),
      },
    },
  )

  const { mutate } = useMarkArticlesRead({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getFindArticlesInfiniteQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getGetUserFeedsQueryKey() })
      },
    },
  })
  const markAllRead = async () => {
    mutate({ params: { f: feedId !== 'all' ? feedId : undefined, s: search } })
  }

  if (!data) {
    return null
  }

  const articles = data.pages.reduce((prev, cur) => [...prev, ...cur.content], [])

  return (
    <>
      <Stack direction={'row'} gap={2}>
        <SearchBar />
        <FeedSettingsBar />
        <Button onClick={markAllRead}>Mark all read</Button>
      </Stack>

      <ArticleList articles={articles} fetchNextPage={fetchNextPage} />

      <Button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        more
      </Button>
    </>
  )
}
