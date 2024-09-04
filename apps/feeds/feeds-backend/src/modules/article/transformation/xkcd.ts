import { z } from 'zod'

import { ArticleBuilderFn } from './transformation'

const xkcdBaseSchema = z.object({
  isoDate: z.string(),
  link: z.string(),
  title: z.string(),
})

const xkcdAtomItemSchema = xkcdBaseSchema.extend({
  id: z.string(),
  summary: z.string(),
})

const xkcdRssItemSchema = xkcdBaseSchema.extend({
  content: z.string(),
  guid: z.string(),
})

export const xkcdAtomArticleBuilder: ArticleBuilderFn = async (item) => {
  const xkcdItem = xkcdAtomItemSchema.parse(item)

  return {
    content: xkcdItem.summary,
    guid: xkcdItem.id,
    link: xkcdItem.link,
    title: xkcdItem.title,
    date: new Date(xkcdItem.isoDate),
  }
}

export const xkcdRssArticleBuilder: ArticleBuilderFn = async (item) => {
  const xkcdItem = xkcdRssItemSchema.parse(item)

  return {
    content: xkcdItem.content,
    guid: xkcdItem.guid,
    link: xkcdItem.link,
    title: xkcdItem.title,
    date: new Date(xkcdItem.isoDate),
  }
}
