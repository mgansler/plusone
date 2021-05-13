import { Inject, Injectable, Logger } from '@nestjs/common'
import { Model } from 'mongoose'

import { ARTICLE_MODEL } from './article.constants'
import { Article } from './article.schema'

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name)

  constructor(@Inject(ARTICLE_MODEL) private articleModel: Model<Article>) {}

  async create(article): Promise<Article | undefined> {
    if (await this.articleModel.findOne({ guid: article.guid })) {
      return
    }

    const createdArticle = new this.articleModel({ ...article, contentBody: article['content:encoded'] })
    return createdArticle.save()
  }
}
