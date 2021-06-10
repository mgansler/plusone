import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Item } from 'rss-parser'
import { InjectRepository } from '@nestjs/typeorm'

import { Article } from '@plusone/feeds/backend/database'

@Injectable()
export class ArticleService {
  constructor(@InjectRepository(Article) private articleRepository: Repository<Article>) {}

  async create(article: Item): Promise<Article | undefined> {
    if (await this.articleRepository.findOne({ where: { guid: article.guid } })) {
      return
    }

    const createdArticle = this.articleRepository.create({ ...article, contentBody: article['content:encoded'] })
    return this.articleRepository.save(createdArticle)
  }
}
