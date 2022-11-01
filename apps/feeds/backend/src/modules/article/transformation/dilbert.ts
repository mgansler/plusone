import Axios from 'axios'
import { JSDOM } from 'jsdom'

import { ArticleBuilderFn } from './transformation'

export const dilbertArticleBuilder: ArticleBuilderFn = async (item) => {
  const document = await Axios.create().get<string>(item.link)
  const jsdom = new JSDOM(document.data)
  const title = jsdom.window.document.title
  const src = (jsdom.window.document.querySelector('.img-comic') as HTMLImageElement).src

  return {
    content: '',
    contentBody: `<img src='${src}' alt='${title}'/>`,
    guid: item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
