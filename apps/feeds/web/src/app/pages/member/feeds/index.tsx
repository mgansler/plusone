import { ExpandLess, ExpandMore, Settings } from '@mui/icons-material'
import {
  Badge,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
import { useMemo, useState } from 'react'
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
    navigate({ pathname: feed.feedId, search: searchParams.toString() })
  }

  const handleGoToFeedSettings = () => navigate(`${feed.feedId}/settings`)

  return (
    <ListItem>
      <ListItemButton aria-label={feed.title} selected={feedId === feed.feedId} onClick={handleGoToFeed}>
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

type TagGroupProps = {
  name: string
  feeds: UserFeedResponseDto[]
}

function TagGroup({ name, feeds }: TagGroupProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const badgeContent = feeds.reduce((total, feed) => total + feed.unreadCount, 0)

  const toggleOpen = () => setIsOpen((cur) => !cur)

  return (
    <>
      <ListItem>
        {isOpen ? (
          <Typography>{name}</Typography>
        ) : (
          <Badge max={999} color={'primary'} badgeContent={badgeContent}>
            <Typography>{name}</Typography>
          </Badge>
        )}
        <IconButton onClick={toggleOpen}>{isOpen ? <ExpandLess /> : <ExpandMore />}</IconButton>
      </ListItem>

      <Collapse in={isOpen}>
        <List dense={true}>
          {feeds.map((feed) => (
            <FeedEntry key={feed.id} feed={feed} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

export function FeedList() {
  const classNames = useClassNames()
  const { feedId } = useParams()
  const navigate = useNavigate()
  const { data } = useGetUserFeeds()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort } = useFeedSettingsContext()

  const taggedFeeds = useMemo(() => {
    return data?.data.reduce((prev, cur) => {
      for (const { name } of cur.tags) {
        prev[name] = Array.isArray(prev[name]) ? [...prev[name], cur] : [cur]
      }
      if (cur.tags.length === 0) {
        prev['other'] = Array.isArray(prev['other']) ? [...prev['other'], cur] : [cur]
      }
      return prev
    }, {})
  }, [data?.data])

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

          {Object.keys(taggedFeeds || {})
            .sort()
            .map((tag) => (
              <TagGroup key={tag} name={tag} feeds={taggedFeeds[tag]} />
            ))}
        </List>
      </Drawer>

      <main style={{ paddingLeft: drawerWidth, height: '100%' }}>
        <Outlet />
      </main>
    </>
  )
}
