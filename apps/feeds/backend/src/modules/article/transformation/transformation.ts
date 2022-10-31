import Parser = require('rss-parser')
import Axios from 'axios'
import { JSDOM } from 'jsdom'

import { Prisma } from '@plusone/feeds-persistence'

type ArticleBuilderFn = (
  item: Parser.Item & { id?: string },
) => Promise<Omit<Prisma.ArticleCreateInput, 'feed' | 'UserArticle'>>

const defaultArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.content,
    contentBody: item['content:encoded'],
    guid: item.guid ?? item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}

const dilbertArticleBuilder: ArticleBuilderFn = async (item) => {
  const document = await Axios.create().get<string>(item.link)
  const jsdom = new JSDOM(document.data)
  const title = jsdom.window.document.title
  const src = (jsdom.window.document.querySelector('.img-comic') as HTMLImageElement).src

  return {
    content: '',
    contentBody: `<img src='${src}' alt='${title}'/>`,
    guid: item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}

export function getArticleBuilderFunction(feedUrl: string): ArticleBuilderFn {
  switch (feedUrl) {
    case 'https://dilbert.com/feed': {
      return dilbertArticleBuilder
    }
    default:
      return defaultArticleBuilder
  }
}
