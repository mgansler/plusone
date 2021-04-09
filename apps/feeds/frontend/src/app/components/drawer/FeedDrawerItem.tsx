import {
  Badge,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core'
import { RssFeed } from '@material-ui/icons'

import { FeedFieldsFragment } from '@plusone/feeds-schema'

import { useSelectedFeeds } from '../../context'
import { SelectionType } from '../../context/SelectedFeedsContext'

import { EditFeed } from './EditFeed'
import { useFeedStyles } from './style'

type FeedDrawerItemProps = {
  feed: FeedFieldsFragment
  subItem?: boolean
}

export function FeedDrawerItem({ feed, subItem }: FeedDrawerItemProps) {
  const classNames = useFeedStyles()
  const { selectedFeeds, select } = useSelectedFeeds()

  const handleSelect = () =>
    select({
      type: SelectionType.Feed,
      payload: feed.id,
    })

  return (
    <ListItem
      button={true}
      className={subItem ? classNames.nested : classNames.drawerItem}
      onClick={handleSelect}
      selected={selectedFeeds.includes(feed.id)}
    >
      <ListItemIcon
        className={
          feed.hasFetchError ? classNames.feedWithError : classNames.avatar
        }
      >
        <RssFeed />
      </ListItemIcon>

      <Badge
        badgeContent={feed.unreadCount}
        color={'primary'}
        className={
          subItem ? classNames.drawerBadgeNested : classNames.drawerBadge
        }
      >
        <ListItemText
          disableTypography={true}
          primary={<Typography noWrap={true}>{feed.title}</Typography>}
        />
      </Badge>

      <EditFeed feed={feed} />
    </ListItem>
  )
}
