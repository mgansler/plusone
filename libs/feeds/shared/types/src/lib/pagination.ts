export interface Pagination {
  take: string
  skip: string
}

export interface Paginated<ContentType> {
  totalCount: number
  content: ContentType[]
}
