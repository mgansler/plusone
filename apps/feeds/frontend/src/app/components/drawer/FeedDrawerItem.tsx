import {
  Badge,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core'
import { RssFeed } from '@material-ui/icons'
import React from 'react'

import { FeedFieldsFragment } from '@plusone/feeds-schema'

import { useSelectedFeeds } from '../../context'
import { SelectionType } from '../../context/SelectedFeedsContext'

import { EditFeed } from './EditFeed'
import { useFeedStyles } from './style'

export const FeedDrawerItem: React.FC<{
  feed: FeedFieldsFragment
  subItem?: boolean
}> = ({ feed, subItem }) => {
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
