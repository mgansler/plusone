import { Stack } from '@mui/material'
import React from 'react'

import { useValidatedRecentlyReadArticles } from '@plusone/feeds/api-client'

import { FeedSettingsBar } from '../../../components/feed-settings-bar'
import { RecentlyReadArticleList } from '../../../components/recent-article-list'
import { SearchBar } from '../../../components/search-bar'

export function RecentArticles() {
  const { data: articles } = useValidatedRecentlyReadArticles()

  if (!articles) {
    return null
  }

  return (
    <>
      <Stack direction={'row'} gap={2}>
        <SearchBar />
        <FeedSettingsBar />
      </Stack>

      <RecentlyReadArticleList articles={articles} />
    </>
  )
}
