import { Outlet } from 'react-router-dom'

import { SearchBar } from '../../components/search-bar'
import { FeedSettingsContextProvider } from '../../context/feed-settings'

export function Member() {
  return (
    <div>
      <FeedSettingsContextProvider>
        <SearchBar />
        <Outlet />
      </FeedSettingsContextProvider>
    </div>
  )
}
