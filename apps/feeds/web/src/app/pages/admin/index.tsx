import { useQuery } from '@tanstack/react-query'

import type { FeedResponse, UserResponse } from '@plusone/feeds/shared/types'

import { Health } from '../../components/health'
import { useQueryFn } from '../../util/api-client'

export function Admin() {
  const fetchAllFeedsQueryFn = useQueryFn('/api/feed')
  const { data: feeds } = useQuery<FeedResponse[]>(['admin-feeds'], fetchAllFeedsQueryFn)
  const fetchUsersQueryFn = useQueryFn('/api/user')
  const { data: users } = useQuery<UserResponse[]>(['admin-users'], fetchUsersQueryFn)

  return (
    <div>
      <h3>Admin Area</h3>
      <Health />
      <div>total feeds: {feeds?.length}</div>
      <div>total users: {users?.length}</div>
    </div>
  )
}
