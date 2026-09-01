import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/feeds-persistence'

import { AuthenticationModule } from '../authentication/authentication.module'

import { ArticleController } from './article.controller'
import { ArticleService } from './article.service'

@Module({
  imports: [AuthenticationModule, PrismaModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
