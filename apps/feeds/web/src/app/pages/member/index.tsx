import { Outlet, useNavigate } from 'react-router-dom'

import { IncludeRead } from '../../components/include-read'
import { SearchBar } from '../../components/search-bar'
import { SortDirection } from '../../components/sort-direction'
import { ArticleFindContextProvider } from '../../context/article-find'

export function Member() {
  const navigate = useNavigate()

  return (
    <div>
      Feeds
      <button onClick={() => navigate('new')}>add feed</button>
      <ArticleFindContextProvider>
        <SearchBar />
        <SortDirection />
        <IncludeRead />
        <Outlet />
      </ArticleFindContextProvider>
    </div>
  )
}
