import { Outlet, useMatches } from '@remix-run/react'
import { matchPath } from 'react-router-dom'

export default function () {
  const matches = useMatches()

  return (
    <main>
      <h2>Day {Number(matchPath('/days/:day', matches[matches.length - 1].pathname)?.params.day)}</h2>
      <Outlet />
    </main>
  )
}
