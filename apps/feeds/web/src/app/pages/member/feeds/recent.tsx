import { Stack } from '@mui/material'
import React from 'react'

import { useRecentlyReadArticles } from '@plusone/feeds/api-client'

import { FeedSettingsBar } from '../../../components/feed-settings-bar'
import { RecentlyReadArticleList } from '../../../components/recent-article-list'
import { SearchBar } from '../../../components/search-bar'

export function RecentArticles() {
  const { data: articles } = useRecentlyReadArticles()

  if (!articles) {
    return null
  }

  return (
    <>
      <Stack direction={'row'} gap={2}>
        <SearchBar />
        <FeedSettingsBar />
      </Stack>

      <RecentlyReadArticleList articles={articles.data} />
    </>
  )
}
