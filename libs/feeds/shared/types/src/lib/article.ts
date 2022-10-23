export interface Article {
  id: string
  title: string
  content: string
  contentBody: string
  guid: string
  link: string
}

export interface ArticleResponse {
  unread: boolean
  cursor: number
  article: Article
}

export interface ToggleUnreadRequest {
  unread: boolean
}
