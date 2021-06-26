import { ArticleResponse } from './article'

export interface Pagination {
  cursor: string
}

export interface Paginated<ContentType> {
  totalCount: number
  pageSize: number
  content: ContentType[]
}

export interface PaginatedArticles extends Paginated<ArticleResponse> {
  unreadCount: number
}
