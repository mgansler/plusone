import { ArticleBuilderFn } from './transformation'

export const defaultArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.content,
    contentBody: item['content:encoded'],
    guid: item.guid ?? item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
