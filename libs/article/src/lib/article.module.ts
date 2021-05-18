import { Module } from '@nestjs/common'

import { DatabaseModule } from '@feeds/database'

import { ArticleService } from './article.service'
import { articleProviders } from './article.providers'

@Module({
  imports: [DatabaseModule],
  providers: [ArticleService, ...articleProviders],
  exports: [ArticleService],
})
export class ArticleModule {}
