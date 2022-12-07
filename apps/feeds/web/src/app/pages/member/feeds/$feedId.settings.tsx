import { Container, Divider, Link as MuiLink, Stack } from '@mui/material'
import { Link, useParams } from 'react-router-dom'

import { FeedSettings } from '../../../components/feed-settings'
import { FeedTags } from '../../../components/feed-tags'

export function FeedIdSettings() {
  const { feedId } = useParams()

  return <Container maxWidth={'md'} key={feedId}>
    <Stack gap={2}>
      <MuiLink to={`../${feedId}`} component={Link}>Close</MuiLink>

      <Divider />

      <FeedSettings />

      <Divider />

      <FeedTags />
    </Stack>
  </Container>
}
