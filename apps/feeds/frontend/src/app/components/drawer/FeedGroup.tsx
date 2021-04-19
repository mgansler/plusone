import {
  Badge,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core'
import { ExpandLess, ExpandMore, Inbox } from '@material-ui/icons'
import { useState } from 'react'
import React from 'react'

import { FeedFieldsFragment, GroupFieldsFragment } from '@plusone/feeds-schema'

import { useSelectedFeeds } from '../../context'
import { SelectionType } from '../../context/SelectedFeedsContext'

import { FeedDrawerItem } from './FeedDrawerItem'
import { useFeedStyles } from './style'

interface FeedGroupProps {
  group: GroupFieldsFragment
  feeds: FeedFieldsFragment[]
}

export const FeedGroup: React.FC<FeedGroupProps> = ({ group, feeds }) => {
  const classNames = useFeedStyles()
  const { selectedGroup, select } = useSelectedFeeds()

  const handleSelect = () =>
    select({
      type: SelectionType.Group,
      payload: {
        groupId: group.id,
        feedIds: feeds.map(({ id }) => id),
      },
    })

  const [isOpen, setIsOpen] = useState<boolean>(true)
  const totalUnreadCount = feeds.reduce(
    (currentTotal, { unreadCount }) => currentTotal + (unreadCount ?? 0),
    0,
  )

  return (
    <React.Fragment>
      <ListItem button={true} onClick={handleSelect} selected={group.id === selectedGroup}>
        <ListItemIcon className={classNames.avatar}>
          <Inbox />
        </ListItemIcon>

        <Badge badgeContent={totalUnreadCount} color={'primary'} max={999}>
          <ListItemText primary={group.name} />
        </Badge>

        <IconButton className={classNames.drawerDelete} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </ListItem>
      <Collapse in={isOpen} unmountOnExit={true}>
        <List component={'div'} disablePadding={true}>
          {feeds.map((feed) => (
            <FeedDrawerItem key={feed.id} feed={feed} subItem={true} />
          ))}
        </List>
      </Collapse>
    </React.Fragment>
  )
}
