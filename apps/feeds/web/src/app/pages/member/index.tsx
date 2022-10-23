import { Outlet, useNavigate } from 'react-router-dom'

import { SearchBar } from '../../components/search-bar'

export function Member() {
  const navigate = useNavigate()

  return (
    <div>
      Feeds
      <button onClick={() => navigate('new')}>add feed</button>
      <SearchBar />
      <Outlet />
    </div>
  )
}
