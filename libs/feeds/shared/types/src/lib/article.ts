export interface ArticleResponse {
  unread: boolean
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
