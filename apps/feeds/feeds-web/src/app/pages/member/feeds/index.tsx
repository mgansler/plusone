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
import { useMemo, useState } from 'react'
import { Link, Outlet, useMatch, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import type { UserFeedResponseDto } from '@plusone/feeds/api-client'
import { Sort, useValidatedGetUserFeeds } from '@plusone/feeds/api-client'

import { useFeedSettingsContext } from '../../../context/feed-settings'

type FeedEntryProps = {
  feed: UserFeedResponseDto
}

function FeedEntry({ feed }: Readonly<FeedEntryProps>) {
  const { feedId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort, setExpandContent } = useFeedSettingsContext()

  const handleGoToFeed = () => {
    setSort(feed.order === 'desc' ? Sort.desc : Sort.asc)
    setIncludeRead(feed.includeRead)
    setExpandContent(feed.expandContent)
    navigate({ pathname: feed.feedId, search: searchParams.toString() })
  }

  const handleGoToFeedSettings = () => navigate(`${feed.feedId}/settings`)

  return (
    <ListItem>
      <ListItemButton aria-label={feed.title} selected={feedId === feed.feedId} onClick={handleGoToFeed}>
        <Badge max={999} color={'primary'} badgeContent={feed.unreadCount}>
          <ListItemText style={{ textDecoration: feed.disabled ? 'line-through' : 'none' }}>{feed.title}</ListItemText>
        </Badge>
      </ListItemButton>
      <IconButton onClick={handleGoToFeedSettings} role={'button'} aria-label={'Settings'}>
        <Settings />
      </IconButton>
    </ListItem>
  )
}

const DRAWER_WIDTH = 320

type TagGroupProps = {
  name: string
  feeds: Array<UserFeedResponseDto>
}

function TagGroup({ name, feeds }: Readonly<TagGroupProps>) {
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
        <List dense={true} aria-label={`${name} feed list`}>
          {feeds.map((feed) => (
            <FeedEntry key={feed.id} feed={feed} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

export function FeedList() {
  const { feedId } = useParams()
  const isRecentPath = useMatch('/member/feeds/recent')
  const isStarredPath = useMatch('/member/feeds/starred')
  const navigate = useNavigate()
  const { data: userFeeds } = useValidatedGetUserFeeds()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort } = useFeedSettingsContext()

  const taggedFeeds = useMemo(() => {
    return userFeeds?.reduce((prev, cur) => {
      for (const { name } of cur.tags) {
        prev[name] = Array.isArray(prev[name]) ? [...prev[name], cur] : [cur]
      }
      if (cur.tags.length === 0) {
        prev['other'] = Array.isArray(prev['other']) ? [...prev['other'], cur] : [cur]
      }
      return prev
    }, {})
  }, [userFeeds])

  const goToAll = () => {
    setSort(Sort.desc)
    setIncludeRead(false)
    navigate({ pathname: 'all', search: searchParams.toString() })
  }

  const totalUnreadCount = userFeeds?.reduce((total, feed) => total + feed.unreadCount, 0)

  return (
    <>
      <Drawer
        variant={'permanent'}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
          },
        }}
      >
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
            <ListItemButton
              aria-label={'recently read articles'}
              selected={isRecentPath !== null}
              onClick={() => navigate({ pathname: 'recent' })}
            >
              <ListItemText>Recently Read</ListItemText>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton
              aria-label={'starred articles'}
              selected={isStarredPath !== null}
              onClick={() => navigate({ pathname: 'starred' })}
            >
              <ListItemText>Starred</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton aria-label={'all feeds'} selected={feedId === 'all'} onClick={goToAll}>
              <Badge max={999} color={'primary'} badgeContent={totalUnreadCount}>
                <ListItemText>All</ListItemText>
              </Badge>
            </ListItemButton>
          </ListItem>

          <Divider />

          {Object.keys(taggedFeeds || {})
            .sort()
            .map((tag) => (
              <TagGroup key={tag} name={tag} feeds={taggedFeeds[tag]} />
            ))}
        </List>
      </Drawer>

      <main style={{ paddingLeft: DRAWER_WIDTH, height: '100%' }}>
        <Outlet />
      </main>
    </>
  )
}
