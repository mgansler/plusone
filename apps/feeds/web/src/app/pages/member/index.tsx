import { Outlet } from 'react-router-dom'

import { FeedSettingsContextProvider } from '../../context/feed-settings'

export function Member() {
  return (
    <FeedSettingsContextProvider>
      <Outlet />
    </FeedSettingsContextProvider>
  )
}
