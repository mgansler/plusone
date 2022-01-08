import { Module } from '@nestjs/common'

import { ArticleModule } from '../modules/article/article.module'
import { AuthenticationModule } from '../modules/authentication/authentication.module'
import { FeedModule } from '../modules/feed/feed.module'
import { SchedulingModule } from '../modules/scheduling/scheduling.module'
import { UserModule } from '../modules/user/user.module'

@Module({
  imports: [ArticleModule, AuthenticationModule, FeedModule, UserModule, SchedulingModule],
})
export class AppModule {}
