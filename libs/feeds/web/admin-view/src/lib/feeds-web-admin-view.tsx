import { Box, Card, CardContent, CardHeader, createStyles, makeStyles, Paper, Typography } from '@material-ui/core'

import { useFetchFeeds } from '@plusone/feeds/web/shared'

import { useFetchUsers } from './use-fetch-users'
import { useTriggerFetch } from './use-trigger-fetch'

const useClassNames = makeStyles((theme) =>
  createStyles({
    card: {
      margin: theme.spacing(1),
    },
  }),
)

export function FeedsWebAdminView() {
  const { data: users = [] } = useFetchUsers()
  const { data: feeds = [] } = useFetchFeeds()
  const triggerFetch = useTriggerFetch()

  const classNames = useClassNames()

  return (
    <Paper>
      <Typography>Welcome to feeds-web-admin-view!</Typography>
      <button onClick={triggerFetch}>Fetch Now!</button>
      <Box display={'flex'} flexWrap={'wrap'}>
        <Card elevation={3} className={classNames.card}>
          <CardHeader title={`Users: ${users.length}`} />
          <CardContent>
            {users.map((user) => (
              <Typography key={user.id}>
                {user.username} - {user.isAdmin ? 'admin' : 'normal user'}
              </Typography>
            ))}
          </CardContent>
        </Card>

        <Card elevation={3} className={classNames.card}>
          <CardHeader title={`Feeds: ${feeds.length}`} />
          <CardContent>
            {feeds.map((feed) => (
              <Typography key={feed.id}>
                {feed.originalTitle}: {feed.feedUrl}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Paper>
  )
}
