import Parser = require('rss-parser')

import { Prisma } from '@plusone/feeds-persistence'

import { defaultArticleBuilder } from './default'
import { dilbertArticleBuilder } from './dilbert'
import { fefeArticleBuilder } from './fefe'
import { youtubeArticleBuilder } from './youtube'

export type ArticleBuilderFn = (
  item: Parser.Item & { id?: string },
) => Promise<Omit<Prisma.ArticleCreateInput, 'feed' | 'UserArticle'>>

export function getArticleBuilderFunction(feedUrl: string): ArticleBuilderFn {
  switch (new URL(feedUrl).hostname) {
    case 'blog.fefe.de':
      return fefeArticleBuilder
    case 'dilbert.com':
      return dilbertArticleBuilder
    case 'www.youtube.com':
      return youtubeArticleBuilder
    default:
      return defaultArticleBuilder
  }
}
