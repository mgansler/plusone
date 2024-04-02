import { Link, Outlet } from '@tanstack/react-router'

import { commandsRoute, discoveryRoute, settingsRoute } from '../routes'

export function App() {
  return (
    <div className={'flex flex-col'}>
      <h1>Elgato Control</h1>

      <Outlet />

      <Link to={commandsRoute.to}>Commands</Link>
      <Link to={discoveryRoute.to}>Discovery</Link>
      <Link to={settingsRoute.to}>Settings</Link>
    </div>
  )
}
