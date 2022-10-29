import { useParams, useSearchParams } from 'react-router-dom'

import { useFindArticlesInfinite } from '@plusone/feeds/api-client'

import { ArticleList } from '../../../components/article-list'
import { useArticleFindContext } from '../../../context/article-find'

export function Articles() {
  const { feedId } = useParams()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search')
  const { sort, includeRead } = useArticleFindContext()

  const { data, hasNextPage, fetchNextPage } = useFindArticlesInfinite(
    { f: feedId !== 'all' ? feedId : undefined, s: search, sort, r: includeRead },
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
    <div>
      {data.pages.map((page, index) => (
        <ArticleList key={index} articles={page.data.content} />
      ))}
      <button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        next
      </button>
    </div>
  )
}
