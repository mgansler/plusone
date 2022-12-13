import { Stack } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import type { ArticleResponseDto, useFindArticlesInfinite } from '@plusone/feeds/api-client'

import { isKeyCombo } from '../utils/keyboard'

import { Article, useReadArticle } from './article'

type ArticleListProps = {
  articles: ArticleResponseDto[]
  fetchNextPage: ReturnType<typeof useFindArticlesInfinite>['fetchNextPage']
}

export function ArticleList({ articles, fetchNextPage }: ArticleListProps) {
  const [selectedArticle, setSelectedArticle] = useState<string>(articles[0]?.article.id)
  const readArticle = useReadArticle()

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const currentIndex = articles.findIndex((article) => article.article.id === selectedArticle)

      switch (true) {
        case isKeyCombo(event, 'ArrowUp') && currentIndex > 0:
          setSelectedArticle(articles[currentIndex - 1].article.id)
          break

        case isKeyCombo(event, 'ArrowDown') && currentIndex < articles.length - 1:
          setSelectedArticle(articles[currentIndex + 1].article.id)
          if (currentIndex > articles.length - 20) {
            fetchNextPage()
          }
          break

        case isKeyCombo(event, 'Space'):
          await readArticle(articles[currentIndex].article.id, articles[currentIndex].unread)
          break

        case isKeyCombo(event, 'KeyN'):
          await readArticle(articles[currentIndex].article.id, true)
          if (currentIndex < articles.length - 1) {
            setSelectedArticle(articles[currentIndex + 1].article.id)
            if (currentIndex > articles.length - 20) {
              fetchNextPage()
            }
          }
          break

        case isKeyCombo(event, 'KeyO'):
          window.open(articles[currentIndex].article.link, '_blank')
          await readArticle(articles[currentIndex].article.id, true)
          break
      }
    }

    // TODO: this gets added/removed every render, is there a way to optimize it?
    // console.log('adding event listener')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      // console.log('removing event listener')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [articles, fetchNextPage, readArticle, selectedArticle])

  useEffect(() => {
    if (containerRef.current && scrollTargetRef.current) {
      containerRef.current.scrollTo(0, scrollTargetRef.current.offsetTop - 144)
    }
  }, [selectedArticle])

  const containerRef = useRef<HTMLDivElement>()
  const scrollTargetRef = useRef<HTMLDivElement>()

  return (
    <Stack style={{ maxHeight: '100%', overflow: 'scroll' }} gap={1} ref={containerRef}>
      {articles.map((article) => (
        <Article
          key={article.article.id}
          article={article}
          selectedArticle={selectedArticle}
          scrollTargetRef={article.article.id === selectedArticle ? scrollTargetRef : undefined}
        />
      ))}
    </Stack>
  )
}
