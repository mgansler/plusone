import { useEffect } from 'react'
import { useMutation } from 'react-apollo'

import {
  MutationToggleArticleUnreadArgs,
  ToggleArticleUnread,
  ToggleArticleUnreadMutation,
} from '@plusone/feeds-schema'

import { useIsKeyboardControlEnabled, useSelectedArticle } from '../../context'
import { useArticles } from '../../hooks'

interface Modifiers {
  shiftKey?: KeyboardEvent['shiftKey']
  altKey?: KeyboardEvent['altKey']
  metaKey?: KeyboardEvent['metaKey']
}

const isKeyCombo = (event: KeyboardEvent, code: KeyboardEvent['code'], modifiers?: Modifiers): boolean => {
  const matches =
    event.code === code &&
    event.altKey === (modifiers?.altKey ?? false) &&
    event.metaKey === (modifiers?.metaKey ?? false) &&
    event.shiftKey === (modifiers?.shiftKey ?? false)
  if (matches) {
    event.preventDefault()
  }
  return matches
}

export const useKeyboardControl = () => {
  const { article, setArticle } = useSelectedArticle()
  const articles = useArticles()

  const [toggleUnread] = useMutation<ToggleArticleUnreadMutation, MutationToggleArticleUnreadArgs>(
    ToggleArticleUnread,
    {
      variables: { id: article ? article.id : '' },
    },
  )

  const isEnabled = useIsKeyboardControlEnabled()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const curIndex = articles.findIndex(({ id }) => id === article?.id)
      switch (isEnabled) {
        case isKeyCombo(event, 'ArrowUp') && curIndex > 0:
          setArticle(articles[curIndex - 1])
          break
        case isKeyCombo(event, 'ArrowDown') && curIndex < articles.length - 1:
          setArticle(articles[curIndex + 1])
          break
        case isKeyCombo(event, 'Space'):
          toggleUnread()
          break
        case isKeyCombo(event, 'KeyN'):
          if (articles[curIndex].unread) {
            toggleUnread()
          }
          if (curIndex < articles.length - 1) {
            setArticle(articles[curIndex + 1])
          }
          break
        case isKeyCombo(event, 'KeyO'):
          window.open(article?.link, '_blank')
          if (articles[curIndex].unread) {
            toggleUnread()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [article, setArticle, articles, toggleUnread, isEnabled])
}
