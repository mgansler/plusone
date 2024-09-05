import { z } from 'zod'

import { ArticleBuilderFn } from './transformation'

const theyCanTalkSchema = z.object({
  link: z.string(),
  content: z.string(),
  contentSnippet: z.string(),
  guid: z.string(),
  categories: z.array(z.string()),
  isoDate: z.string(),
})

export const theyCanTalkArticleBuilder: ArticleBuilderFn = async (item) => {
  const theyCanTalkItem = theyCanTalkSchema.parse(item)

  return {
    content: theyCanTalkItem.content,
    guid: theyCanTalkItem.guid,
    link: theyCanTalkItem.link,
    title: theyCanTalkItem.contentSnippet.split('\n')[0],
    date: theyCanTalkItem.isoDate ? new Date(theyCanTalkItem.isoDate) : new Date(),
  }
}
