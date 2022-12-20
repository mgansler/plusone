export interface Article {
  contentBody: string
  date: Date
  guid: string
  id: string
  link: string
  title: string
}

export interface ArticleResponse {
  article: Article
  cursor: number
  starred: boolean
  unread: boolean
}

export interface ToggleUnreadRequest {
  unread: boolean
}
