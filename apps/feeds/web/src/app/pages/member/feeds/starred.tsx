import { Button, Stack } from '@mui/material'
import React from 'react'

import { useStarredArticlesInfinite } from '@plusone/feeds/api-client'

import { ArticleList } from '../../../components/article-list'
import { FeedSettingsBar } from '../../../components/feed-settings-bar'
import { SearchBar } from '../../../components/search-bar'

export function StarredArticles() {
  const { data, hasNextPage, fetchNextPage } = useStarredArticlesInfinite()

  if (!data) {
    return null
  }

  const articles = data.pages.reduce((prev, cur) => [...prev, ...cur.data.content], [])

  return (
    <>
      <Stack direction={'row'} gap={2}>
        <SearchBar />
        <FeedSettingsBar />
      </Stack>

      <ArticleList articles={articles} fetchNextPage={fetchNextPage} />

      <Button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        more
      </Button>
    </>
  )
}
