import { ArrowDownward, ArrowUpward, ExpandLess, ExpandMore } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel } from '@mui/material'

import { Sort } from '@plusone/feeds/api-client'

import { useFeedSettingsContext } from '../context/feed-settings'

export function FeedSettingsBar() {
  const { sort, setSort, includeRead, setIncludeRead, expandContent, setExpandContent } = useFeedSettingsContext()

  return (
    <div style={{ display: 'flex' }}>
      <Button
        startIcon={sort === Sort.desc ? <ArrowUpward /> : <ArrowDownward />}
        onClick={() => setSort((cur) => (cur === Sort.desc ? Sort.asc : Sort.desc))}
      >
        {sort === Sort.desc ? 'newest first' : 'oldest first'}
      </Button>

      <FormControlLabel
        control={<Checkbox checked={includeRead} onChange={() => setIncludeRead((cur) => !cur)} />}
        label={'Include Read'}
      />

      <Button
        startIcon={expandContent ? <ExpandLess /> : <ExpandMore />}
        onClick={() => setExpandContent((cur) => !cur)}
      >
        {expandContent ? 'collapse all' : 'expand all'}
      </Button>
    </div>
  )
}
