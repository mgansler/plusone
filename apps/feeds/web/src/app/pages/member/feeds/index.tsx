import { Settings } from '@mui/icons-material'
import {
  Badge,
  Divider,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
import React from 'react'
import { Link, Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import type { UserFeedResponseDto } from '@plusone/feeds/api-client'
import { useGetUserFeeds } from '@plusone/feeds/api-client'
import { Sort } from '@plusone/feeds/shared/types'

import { useFeedSettingsContext } from '../../../context/feed-settings'

type FeedEntryProps = {
  feed: UserFeedResponseDto
}

function FeedEntry({ feed }: FeedEntryProps) {
  const { feedId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort, setExpandContent } = useFeedSettingsContext()

  const handleGoToFeed = () => {
    setSort(feed.order === 'desc' ? Sort.NewestFirst : Sort.OldestFirst)
    setIncludeRead(feed.includeRead)
    setExpandContent(feed.expandContent)
    navigate({ pathname: feed.id, search: searchParams.toString() })
  }

  const handleGoToFeedSettings = () => navigate(`${feed.id}/settings`)

  return (
    <ListItem>
      <ListItemButton aria-label={feed.title} selected={feedId === feed.id} onClick={handleGoToFeed}>
        <Badge max={999} color={'primary'} badgeContent={feed.unreadCount}>
          <ListItemText>{feed.title}</ListItemText>
        </Badge>
      </ListItemButton>
      <IconButton onClick={handleGoToFeedSettings}>
        <Settings />
      </IconButton>
    </ListItem>
  )
}

const drawerWidth = 320
const useClassNames = makeStyles(() =>
  createStyles({
    drawerPaper: {
      width: drawerWidth,
    },
  }),
)

export function FeedList() {
  const classNames = useClassNames()
  const { feedId } = useParams()
  const navigate = useNavigate()
  const { data } = useGetUserFeeds()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort } = useFeedSettingsContext()

  const goToAll = () => {
    setSort(Sort.NewestFirst)
    setIncludeRead(false)
    navigate({ pathname: 'all', search: searchParams.toString() })
  }

  const totalUnreadCount = data?.data.reduce((total, feed) => total + feed.unreadCount, 0)

  return (
    <>
      <Drawer variant={'permanent'} classes={{ paper: classNames.drawerPaper }}>
        <Toolbar />

        <List dense={true}>
          <MuiLink to={'../new'} component={Link}>
            add feed
          </MuiLink>
          <MuiLink to={'../tags'} component={Link}>
            tags
          </MuiLink>
          <Divider />
          <ListItem>
            <ListItemButton aria-label={'all feeds'} selected={feedId === 'all'} onClick={goToAll}>
              <Badge max={999} color={'primary'} badgeContent={totalUnreadCount}>
                <ListItemText>All</ListItemText>
              </Badge>
            </ListItemButton>
          </ListItem>

          {data?.data.map((feed) => (
            <FeedEntry key={feed.id} feed={feed} />
          ))}
        </List>
      </Drawer>

      <main style={{ paddingLeft: drawerWidth }}>
        <Outlet />
      </main>
    </>
  )
}
