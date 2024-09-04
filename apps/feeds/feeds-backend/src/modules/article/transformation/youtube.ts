import { z } from 'zod'

import { ArticleBuilderFn } from './transformation'

const youtubeItemSchema = z.object({
  id: z.string(),
  isoDate: z.string(),
  link: z.string(),
  title: z.string(),
})

export const youtubeArticleBuilder: ArticleBuilderFn = async (item) => {
  const youtubeItem = youtubeItemSchema.parse(item)

  const content = `
  <iframe
    src="${youtubeItem.link.replace('watch?v=', 'embed/')}"
    frameborder="0"
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen="true"
  />
`

  return {
    content,
    guid: youtubeItem.id,
    link: youtubeItem.link,
    title: youtubeItem.title,
    date: new Date(youtubeItem.isoDate),
  }
}
