import { useGetFeeds, useGetUsers } from '@plusone/feeds/api-client'

import { Health } from '../../components/health'

export function Admin() {
  const { data: feeds } = useGetFeeds()
  const { data: users } = useGetUsers()

  return (
    <div>
      <h3>Admin Area</h3>
      <Health />
      <div>total feeds: {feeds?.data.length}</div>
      <div>total users: {users?.data.length}</div>
    </div>
  )
}
