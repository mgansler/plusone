import { ArticleBuilderFn } from './transformation'

export const defaultArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.content,
    contentBody: item['content:encoded'] ?? item.content,
    guid: item.guid ?? item.id ?? item.link,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
