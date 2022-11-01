import { Sort } from '@plusone/feeds/shared/types'

import { useFeedSettingsContext } from '../context/feed-settings'

export function SortDirection() {
  const { sort, setSort } = useFeedSettingsContext()

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
