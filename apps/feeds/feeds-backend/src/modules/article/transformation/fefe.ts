import { z } from 'zod'

import { ArticleBuilderFn } from './transformation'

const fefeItemSchema = z.object({
  guid: z.string().optional(),
  id: z.string().optional(),
  link: z.string(),
  content: z.string().optional(),
  title: z.string(),
})

export const fefeArticleBuilder: ArticleBuilderFn = async (item) => {
  const fefeItem = fefeItemSchema.parse(item)

  return {
    content: fefeItem.content ?? fefeItem.title,
    guid: fefeItem.guid ?? fefeItem.id ?? fefeItem.link,
    link: fefeItem.link,
    title: fefeItem.title.substring(0, 80) + '...',
    date: new Date(),
  }
}
