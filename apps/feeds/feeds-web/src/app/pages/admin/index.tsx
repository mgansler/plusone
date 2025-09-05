import { Link, Outlet } from 'react-router-dom'

import { useValidatedGetAdminStats } from '@plusone/feeds/api-client'

import { Health } from '../../components/health'

export function Admin() {
  const { data: adminStats } = useValidatedGetAdminStats()

  return (
    <div>
      <h3>Admin Area</h3>
      <Health />
      <div>total feeds: {adminStats?.feedCount}</div>
      <div>total articles: {adminStats?.articleCount}</div>
      <Link to={'users'}>total users: {adminStats?.userCount}</Link>
      <Outlet />
    </div>
  )
}
