import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { PrismaModule } from '@plusone/feeds-persistence'

import { HealthController } from './health.controller'

@Module({
  imports: [TerminusModule, PrismaModule],
  providers: [],
  controllers: [HealthController],
})
export class HealthModule {}
