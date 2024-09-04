import { z } from 'zod'

const feedItemSchema = z.object({
  link: z.string().optional(),
  guid: z.string().optional(),
  title: z.string().optional(),
  pubDate: z.string().optional(),
  creator: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  isoDate: z.string().optional(),
  categories: z.array(z.string()).optional(),
  contentSnippet: z.string().optional(),
})

export const discoveredFeedSchema = z.object({
  title: z.string(),
  feedUrl: z.string().optional(),
  items: z.array(feedItemSchema),
})

export type DiscoverFeed = z.infer<typeof discoveredFeedSchema>
