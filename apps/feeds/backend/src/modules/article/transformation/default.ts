import { ArticleBuilderFn } from './transformation'

export const defaultArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item['content:encoded'] ?? item.content,
    guid: item.guid ?? item.id ?? item.link,
    link: item.link,
    title: item.title,
    date: item.isoDate ? new Date(item.isoDate) : new Date(),
  }
}
