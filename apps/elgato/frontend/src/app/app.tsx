import { Link, Outlet } from '@tanstack/react-router'

import { discoveryRoute, settingsRoute } from '../routes'

export function App() {
  return (
    <div className={'flex flex-col'}>
      <h1>Elgato Control</h1>

      <Outlet />

      <Link to={discoveryRoute.to}>Discovery</Link>
      <Link to={settingsRoute.to}>Settings</Link>
    </div>
  )
}
