import { Module } from '@nestjs/common'

import { BootInfoController } from './boot-info.controller'

@Module({
  controllers: [BootInfoController],
})
export class BootInfoModule {}
