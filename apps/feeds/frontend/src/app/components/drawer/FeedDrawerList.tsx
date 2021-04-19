import { Divider, Drawer, List } from '@material-ui/core'
import { useQuery, useSubscription } from 'react-apollo'

import { FeedsAndGroups, FeedsAndGroupsQuery, FeedSubscription } from '@plusone/feeds-schema'

import { ToolbarMixin } from '../mixins'

import { AllUnread } from './AllUnread'
import { FeedDrawerItem } from './FeedDrawerItem'
import { FeedGroup } from './FeedGroup'
import { useFeedStyles } from './style'

export function FeedDrawerList() {
  const classNames = useFeedStyles()

  const { loading, data } = useQuery<FeedsAndGroupsQuery>(FeedsAndGroups)
  useSubscription(FeedSubscription)

  const feedsWithUnreadArticles = data
    ? data.feeds.filter(({ unreadCount, group }) => group === null && (unreadCount ?? 0) > 0)
    : []
  const feedsWithoutUnreadArticles = data
    ? data.feeds.filter(({ unreadCount, group }) => group === null && (unreadCount ?? 0) === 0)
    : []

  if (loading || data === undefined) {
    return <List />
  }

  return (
    <Drawer
      classes={{ root: classNames.drawer, paper: classNames.drawerPaper }}
      variant={'permanent'}
    >
      <ToolbarMixin />

      <List className={classNames.feedList}>
        <AllUnread />
        <Divider className={classNames.divider} />
        {data?.groups.map((group) => (
          <FeedGroup
            key={group.id}
            group={group}
            feeds={data?.feeds.filter((feed) => feed.group?.id === group.id)}
          />
        ))}
        <Divider className={classNames.divider} />
        {feedsWithUnreadArticles.map((feed) => (
          <FeedDrawerItem key={feed.id} feed={feed} />
        ))}
        <Divider className={classNames.divider} />
        {feedsWithoutUnreadArticles.map((feed) => (
          <FeedDrawerItem key={feed.id} feed={feed} />
        ))}
      </List>
    </Drawer>
  )
}
