import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

import { Sort } from '@plusone/feeds/shared/types'

type ArticleFindContextValue = {
  sort: Sort
  setSort: (sort: Sort) => void
}

const ArticleFindContext = createContext<ArticleFindContextValue>(undefined)

type ArticleFindContextProviderProps = {
  children: ReactNode
}

export function ArticleFindContextProvider({ children }: ArticleFindContextProviderProps) {
  const [sort, setSort] = useState<Sort>(Sort.NewestFirst)

  return <ArticleFindContext.Provider children={children} value={{ sort, setSort }} />
}

export function useArticleFindContext() {
  const context = useContext(ArticleFindContext)

  if (typeof context === 'undefined') {
    throw new Error('useArticleFindContext must be used within a ArticleFindContextProvider.')
  }

  return context
}
