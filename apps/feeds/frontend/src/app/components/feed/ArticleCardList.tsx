import React, { useEffect, useRef, useState } from 'react'

import { useSelectedArticle } from '../../context'
import { useArticles } from '../../hooks'
import { useKeyboardControl } from '../keyboardControl'

import { ArticleCard } from './ArticleCard'
import { useFeedStyles } from './style'

export const ArticleCardList: React.FC = () => {
  const classNames = useFeedStyles()
  const articles = useArticles()
  useKeyboardControl()
  const { article: selectedArticle } = useSelectedArticle()

  const container = useRef<HTMLDivElement | null>(null)
  const scrollTarget = useRef<HTMLDivElement>()

  useEffect(() => {
    if (container.current && scrollTarget.current) {
      container.current.scrollTo(0, scrollTarget.current.offsetTop - 72)
    }
  }, [selectedArticle])

  const containerHeight = (container.current?.lastChild as HTMLDivElement)
    ?.clientHeight
  const [height, setHeight] = useState<number>(0)
  useEffect(() => {
    if (container.current) {
      const lastElHeight =
        (container.current.lastChild as HTMLDivElement)?.clientHeight ?? 0
      const containerHeight = container.current.clientHeight
      setHeight(containerHeight - lastElHeight)
    }
  }, [articles, containerHeight])

  return (
    <div
      className={classNames.articleList}
      style={{ paddingBottom: height - 16 }}
      ref={container}
    >
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          scrollTargetRef={
            article.id === selectedArticle?.id ? scrollTarget : undefined
          }
        />
      ))}
    </div>
  )
}
