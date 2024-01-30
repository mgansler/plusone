import type { ArticleResponse } from './article'

export type Pagination = {
  cursor: string
}

export type Paginated<ContentType> = {
  totalCount: number
  lastCursor?: number
  pageSize: number
  content: Array<ContentType>
}

export type PaginatedArticles = {
  unreadCount: number
} & Paginated<ArticleResponse>
