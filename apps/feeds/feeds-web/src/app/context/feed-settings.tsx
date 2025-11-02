import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

import { Sort } from '@plusone/feeds/api-client'

type FeedSettingsContextValue = {
  sort: Sort
  setSort: Dispatch<SetStateAction<Sort>>
  includeRead: boolean
  setIncludeRead: Dispatch<SetStateAction<boolean>>
  expandContent: boolean
  setExpandContent: Dispatch<SetStateAction<boolean>>
}

const FeedSettingsContext = createContext<FeedSettingsContextValue>(undefined)

type FeedSettingsContextProviderProps = {
  children: ReactNode
}

export function FeedSettingsContextProvider({ children }: Readonly<FeedSettingsContextProviderProps>) {
  const [sort, setSort] = useState<Sort>(Sort.desc)
  const [includeRead, setIncludeRead] = useState<boolean>(false)
  const [expandContent, setExpandContent] = useState<boolean>(true)

  return (
    <FeedSettingsContext.Provider
      value={{
        sort,
        setSort,
        includeRead,
        setIncludeRead,
        expandContent,
        setExpandContent,
      }}
    >
      {children}
    </FeedSettingsContext.Provider>
  )
}

export function useFeedSettingsContext() {
  const context = useContext(FeedSettingsContext)

  if (typeof context === 'undefined') {
    throw new Error('useFeedSettingsContext must be used within a FeedSettingsContextProvider.')
  }

  return context
}
