import { useFeedControllerGetInfinite } from '@plusone/feeds/api-client'
import type { FeedResponse } from '@plusone/feeds/shared/types'

import { ArticleList } from '../../components/article-list'

type ArticlesProps = {
  feed: FeedResponse
}

export function Articles({ feed }: ArticlesProps) {
  const { data, hasNextPage, fetchNextPage } = useFeedControllerGetInfinite(
    feed.id,
    {},
    {
      query: {
        getNextPageParam: (lastPage) =>
          lastPage.data.content.length < lastPage.data.pageSize ? false : lastPage.data.lastCursor,
      },
    },
  )

  if (!data) {
    return null
  }

  return (
    <>
      {data.pages.map((page, index) => (
        <ArticleList key={index} articles={page.data.content} />
      ))}
      <button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        next
      </button>
    </>
  )
}
