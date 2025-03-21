import { Stack } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import type { ArticleResponseDto } from '@plusone/feeds/api-client'

import { isKeyCombo } from '../utils/keyboard'

import { Article, useReadArticle } from './article'

type ArticleListProps = {
  articles: Array<ArticleResponseDto>
}

export function RecentlyReadArticleList({ articles }: ArticleListProps) {
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
          break

        case isKeyCombo(event, 'Space'):
          await readArticle(articles[currentIndex].article.id, false)
          if (currentIndex < articles.length - 1) {
            setSelectedArticle(articles[currentIndex + 1].article.id)
          }
          break

        case isKeyCombo(event, 'KeyN'):
          if (currentIndex < articles.length - 1) {
            setSelectedArticle(articles[currentIndex + 1].article.id)
          }
          break

        case isKeyCombo(event, 'KeyO'):
          window.open(articles[currentIndex].article.link, '_blank')
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
  }, [articles, readArticle, selectedArticle])

  useEffect(() => {
    if (containerRef.current && scrollTargetRef.current) {
      containerRef.current.scrollTo(0, scrollTargetRef.current.offsetTop - 144)
    }
  }, [selectedArticle])

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTargetRef = useRef<HTMLDivElement>(null)

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
