import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { DebugController } from './debug.controller'
import { AuthModule } from './auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DebugController],
})
export class DebugModule {}
