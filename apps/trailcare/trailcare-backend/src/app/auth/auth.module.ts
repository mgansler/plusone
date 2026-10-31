import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { PrismaModule } from '@plusone/trailcare-persistence'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SessionGuard } from './session.guard'
import { SessionService } from './session.service'

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, { provide: APP_GUARD, useClass: SessionGuard }],
  exports: [SessionService],
})
export class AuthModule {}
