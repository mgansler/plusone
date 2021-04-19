import {
  Badge,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core'
import { MoreVert, RssFeed } from '@material-ui/icons'
import gql from 'graphql-tag'
import { useApolloClient } from 'react-apollo'

import { Feed } from '@plusone/feeds-schema'

import { DefaultGroups, useSelectedFeeds } from '../../context'
import { SelectionType } from '../../context/SelectedFeedsContext'

import { useFeedStyles } from './style'

export function AllUnread() {
  const classNames = useFeedStyles()
  const { selectedGroup, select } = useSelectedFeeds()

  const data = useApolloClient().readQuery<{
    feeds: Pick<Feed, 'unreadCount'>[]
  }>({
    query: gql`
      query Feeds {
        feeds {
          unreadCount
        }
      }
    `,
  })

  const totalUnreadCount = data?.feeds.reduce(
    (currentTotal, { unreadCount }) => currentTotal + (unreadCount ?? 0),
    0,
  )

  const handleSelect = () =>
    select({
      type: SelectionType.Group,
      payload: { groupId: DefaultGroups.AllUnread, feedIds: [] },
    })

  return (
    <ListItem
      button={true}
      className={classNames.drawerItem}
      onClick={handleSelect}
      selected={selectedGroup === DefaultGroups.AllUnread}
    >
      <ListItemIcon className={classNames.avatar}>
        <RssFeed />
      </ListItemIcon>
      <Badge
        badgeContent={totalUnreadCount}
        color={'primary'}
        className={classNames.drawerBadge}
        max={999}
      >
        <ListItemText primary={<Typography noWrap={true}>All Unread</Typography>} />
      </Badge>
      <IconButton className={classNames.drawerDelete}>
        <MoreVert />
      </IconButton>
    </ListItem>
  )
}
