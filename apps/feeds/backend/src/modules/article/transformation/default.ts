import { z } from 'zod'

import { ArticleBuilderFn } from './transformation'

const defaultItemSchema = z.object({
  ['content:encoded']: z.string().optional(),
  content: z.string().optional(),
  guid: z.string().optional(),
  id: z.string().optional(),
  link: z.string(),
  title: z.string(),
  isoDate: z.string().optional(),
})

export const defaultArticleBuilder: ArticleBuilderFn = async (item) => {
  const defaultItem = defaultItemSchema.parse(item)

  return {
    content: defaultItem['content:encoded'] ?? defaultItem.content,
    guid: defaultItem.guid ?? defaultItem.id ?? defaultItem.link,
    link: defaultItem.link,
    title: defaultItem.title,
    date: defaultItem.isoDate ? new Date(defaultItem.isoDate) : new Date(),
  }
}
