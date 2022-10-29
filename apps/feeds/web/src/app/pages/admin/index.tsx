import { Link, Outlet } from 'react-router-dom'

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
      <Link to={'users'}>total users: {users?.data.length}</Link>
      <Outlet />
    </div>
  )
}
