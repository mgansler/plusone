export interface ArticleResponse {
  unread: boolean
  cursor: number
  article: {
    id: string
    title: string
    content: string
    contentBody: string
    guid: string
    link: string
  }
}

export interface ToggleUnreadRequest {
  unread: boolean
}
