import { Module } from '@nestjs/common'

import { PrismaModule } from '@plusone/elgato-persistence'

import { DeviceModule } from '../device/device.module'

import { CommandsController } from './commands.controller'
import { CommandsService } from './commands.service'

@Module({
  imports: [DeviceModule, PrismaModule],
  controllers: [CommandsController],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}
