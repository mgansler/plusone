import { Button } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  getFindArticlesQueryKey,
  getGetUserFeedsQueryKey,
  useFindArticlesInfinite,
  useMarkArticlesRead,
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

  const { data, hasNextPage, fetchNextPage } = useFindArticlesInfinite(
    { f: feedId !== 'all' ? feedId : undefined, s: search, sort, r: includeRead },
    {
      query: {
        getNextPageParam: (lastPage) =>
          lastPage.data.content.length < lastPage.data.pageSize ? false : lastPage.data.lastCursor,
      },
    },
  )

  const { mutateAsync } = useMarkArticlesRead({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getFindArticlesQueryKey())
        await queryClient.invalidateQueries(getGetUserFeedsQueryKey())
      },
    },
  })
  const markAllRead = async () => {
    await mutateAsync({ params: { f: feedId !== 'all' ? feedId : undefined, s: search } })
  }

  if (!data) {
    return null
  }

  return (
    <>
      <SearchBar />
      <FeedSettingsBar />
      <Button onClick={markAllRead}>Mark all read</Button>
      {data.pages.map((page, index) => (
        <ArticleList key={index} articles={page.data.content} />
      ))}
      <Button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        more
      </Button>
    </>
  )
}
