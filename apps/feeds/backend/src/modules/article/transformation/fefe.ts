import { z } from 'zod'

import { ArticleBuilderFn } from './transformation'

const fefeItemSchema = z.object({
  guid: z.string().optional(),
  id: z.string(),
  link: z.string(),
  content: z.string(),
  title: z.string(),
})

export const fefeArticleBuilder: ArticleBuilderFn = async (item) => {
  const fefeItem = fefeItemSchema.parse(item)

  return {
    content: fefeItem.content,
    guid: fefeItem.guid ?? fefeItem.id,
    link: fefeItem.link,
    title: fefeItem.title,
    date: new Date(),
  }
}
