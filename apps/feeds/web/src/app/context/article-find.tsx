import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

import { Sort } from '@plusone/feeds/shared/types'

type ArticleFindContextValue = {
  sort: Sort
  setSort: Dispatch<SetStateAction<Sort>>
  includeRead: boolean
  setIncludeRead: Dispatch<SetStateAction<boolean>>
}

const ArticleFindContext = createContext<ArticleFindContextValue>(undefined)

type ArticleFindContextProviderProps = {
  children: ReactNode
}

export function ArticleFindContextProvider({ children }: ArticleFindContextProviderProps) {
  const [sort, setSort] = useState<Sort>(Sort.NewestFirst)
  const [includeRead, setIncludeRead] = useState<boolean>(false)

  return <ArticleFindContext.Provider children={children} value={{ sort, setSort, includeRead, setIncludeRead }} />
}

export function useArticleFindContext() {
  const context = useContext(ArticleFindContext)

  if (typeof context === 'undefined') {
    throw new Error('useArticleFindContext must be used within a ArticleFindContextProvider.')
  }

  return context
}
