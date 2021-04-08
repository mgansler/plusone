import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'

import { ArticleFieldsFragment } from '@plusone/feeds-schema'

interface ContextState {
  article?: ArticleFieldsFragment
}

interface ContextValue extends ContextState {
  setArticle: Dispatch<SetStateAction<ContextState['article']>>
}

const defaultValue: ContextValue = {
  article: undefined,
  setArticle: (article) => undefined,
}

const Context = createContext<ContextValue>(defaultValue)

export const SelectedArticleProvider: React.FC = ({ children }) => {
  const [article, setArticle] = useState<ArticleFieldsFragment | undefined>(
    defaultValue.article,
  )

  return (
    <Context.Provider value={{ article, setArticle }}>
      {children}
    </Context.Provider>
  )
}

export const useSelectedArticle = () => useContext<ContextValue>(Context)
