import { ArrowDownward, ArrowUpward, ExpandLess, ExpandMore } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel } from '@mui/material'
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
      <Button
        startIcon={sort === Sort.NewestFirst ? <ArrowUpward /> : <ArrowDownward />}
        onClick={() => setSort((cur) => (cur === Sort.NewestFirst ? Sort.OldestFirst : Sort.NewestFirst))}
      >
        {sort === Sort.NewestFirst ? 'newest first' : 'oldest first'}
      </Button>

      <FormControlLabel
        control={<Checkbox checked={includeRead} onChange={() => setIncludeRead((cur) => !cur)} />}
        label={'Include Read'}
      />

      <Button
        startIcon={expandContent ? <ExpandMore /> : <ExpandLess />}
        onClick={() => setExpandContent((cur) => !cur)}
      >
        {expandContent ? 'collapse all' : 'expand all'}
      </Button>

      <Button onClick={storeSettings}>save</Button>
    </div>
  )
}
