import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

import { Sort } from '@plusone/feeds/shared/types'

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

export function FeedSettingsContextProvider({ children }: FeedSettingsContextProviderProps) {
  const [sort, setSort] = useState<Sort>(Sort.NewestFirst)
  const [includeRead, setIncludeRead] = useState<boolean>(false)
  const [expandContent, setExpandContent] = useState<boolean>(true)

  return (
    <FeedSettingsContext.Provider
      children={children}
      value={{
        sort,
        setSort,
        includeRead,
        setIncludeRead,
        expandContent,
        setExpandContent,
      }}
    />
  )
}

export function useFeedSettingsContext() {
  const context = useContext(FeedSettingsContext)

  if (typeof context === 'undefined') {
    throw new Error('useFeedSettingsContext must be used within a FeedSettingsContextProvider.')
  }

  return context
}
