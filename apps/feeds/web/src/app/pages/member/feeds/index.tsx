import { Badge, Button, Divider, Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
import React from 'react'
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom'

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

  return (
    <ListItemButton aria-label={feed.title} selected={feedId === feed.id} onClick={handleGoToFeed}>
      <Badge max={999} color={'primary'} badgeContent={feed.unreadCount}>
        <ListItemText>{feed.title}</ListItemText>
      </Badge>
    </ListItemButton>
  )
}

const drawerWidth = 320
const useClassNames = makeStyles((theme) =>
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

        <List>
          <Button onClick={() => navigate('../new')}>add feed</Button>
          <Divider />
          <ListItemButton aria-label={'all feeds'} selected={feedId === 'all'} onClick={goToAll}>
            <Badge max={999} color={'primary'} badgeContent={totalUnreadCount}>
              <ListItemText>All</ListItemText>
            </Badge>
          </ListItemButton>

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
