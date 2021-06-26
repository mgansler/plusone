import { ArticleResponse } from './article'

export interface Pagination {
  take: string
  skip: string
}

export interface Paginated<ContentType> {
  totalCount: number
  content: ContentType[]
}

export interface PaginatedArticles extends Paginated<ArticleResponse> {
  unreadCount: number
}
