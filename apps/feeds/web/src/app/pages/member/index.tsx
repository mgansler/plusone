import { Outlet } from 'react-router-dom'

import { FeedSettingsBar } from '../../components/feed-settings-bar'
import { SearchBar } from '../../components/search-bar'
import { FeedSettingsContextProvider } from '../../context/feed-settings'

export function Member() {
  return (
    <div>
      <FeedSettingsContextProvider>
        <SearchBar />
        <FeedSettingsBar />
        <Outlet />
      </FeedSettingsContextProvider>
    </div>
  )
}
