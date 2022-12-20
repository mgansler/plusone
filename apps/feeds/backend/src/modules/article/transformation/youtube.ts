import { ArticleBuilderFn } from './transformation'

export const youtubeArticleBuilder: ArticleBuilderFn = async (item) => {
  const content = `
  <iframe
    src='${item.link.replace('watch?v=', 'embed/')}'
    frameborder='0'
    allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
    allowfullscreen='true'
  />
`

  return {
    content,
    guid: item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
