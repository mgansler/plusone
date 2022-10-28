import { Sort } from '@plusone/feeds/shared/types'

import { useArticleFindContext } from '../context/article-find'

export function SortDirection() {
  const { sort, setSort } = useArticleFindContext()

  return (
    <div>
      <button disabled={sort === Sort.NewestFirst} onClick={() => setSort(Sort.NewestFirst)}>
        Newest
      </button>
      <button disabled={sort === Sort.OldestFirst} onClick={() => setSort(Sort.OldestFirst)}>
        Oldest
      </button>
    </div>
  )
}
