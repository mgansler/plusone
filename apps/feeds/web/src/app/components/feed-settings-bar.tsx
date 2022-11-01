import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { getGetUserFeedsQueryKey, useUpdateFeedSettings } from '@plusone/feeds/api-client'
import { Sort } from '@plusone/feeds/shared/types'

import { useFeedSettingsContext } from '../context/feed-settings'

export function FeedSettingsBar() {
  const { feedId } = useParams()
  const { sort, setSort, includeRead, setIncludeRead, expandContent, setExpandContent } = useFeedSettingsContext()

  const queryClient = useQueryClient()
  const { mutateAsync } = useUpdateFeedSettings({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(getGetUserFeedsQueryKey())
      },
    },
  })

  const storeSettings = async () => {
    await mutateAsync({ id: feedId, data: { order: sort, expandContent, includeRead } })
  }

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

      <button onClick={storeSettings}>save</button>
    </div>
  )
}
