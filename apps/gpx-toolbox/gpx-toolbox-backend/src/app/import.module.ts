import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/gpx-toolbox-persistence'

import { ImportController } from './import.controller'
import { ImportService } from './import.service'

@Module({
  imports: [PrismaModule],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
