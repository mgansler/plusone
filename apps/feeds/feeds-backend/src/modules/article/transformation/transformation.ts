import Parser = require('rss-parser')

import { Prisma } from '@plusone/feeds-persistence'

import { defaultArticleBuilder } from './default'
import { fefeArticleBuilder } from './fefe'
import { theyCanTalkArticleBuilder } from './they-can-talk'
import { xkcdAtomArticleBuilder, xkcdRssArticleBuilder } from './xkcd'
import { youtubeArticleBuilder } from './youtube'

export type ArticleBuilderFn = (
  item: Parser.Item & { id?: string },
) => Promise<Omit<Prisma.ArticleCreateInput, 'feed' | 'UserArticle'>>

export function getArticleBuilderFunction(feedUrl: string): ArticleBuilderFn {
  switch (new URL(feedUrl).hostname) {
    case 'blog.fefe.de':
      return fefeArticleBuilder
    case 'theycantalk.com':
      return theyCanTalkArticleBuilder
    case 'xkcd.com':
      return new URL(feedUrl).pathname === '/atom.xml' ? xkcdAtomArticleBuilder : xkcdRssArticleBuilder
    case 'www.youtube.com':
      return youtubeArticleBuilder
    default:
      return defaultArticleBuilder
  }
}
