import { Sort } from '@plusone/feeds/shared/types'

import { useFeedSettingsContext } from '../context/feed-settings'

export function FeedSettingsBar() {
  const { sort, setSort, includeRead, setIncludeRead, expandContent, setExpandContent } = useFeedSettingsContext()

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <button disabled={sort === Sort.NewestFirst} onClick={() => setSort(Sort.NewestFirst)}>
          Newest
        </button>
        <button disabled={sort === Sort.OldestFirst} onClick={() => setSort(Sort.OldestFirst)}>
          Oldest
        </button>
      </div>

      <label>
        Include read
        <input type={'checkbox'} checked={includeRead} onChange={() => setIncludeRead((cur) => !cur)} />
      </label>

      <button onClick={() => setExpandContent((cur) => !cur)}>{expandContent ? 'collapse all' : 'expand all'}</button>
    </div>
  )
}
