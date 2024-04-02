import { Module } from '@nestjs/common'

import { CommandsModule } from '../commands/commands.module'
import { DeviceModule } from '../device/device.module'

import { AppleShortcutsController } from './apple-shortcuts.controller'
import { StreamDeckController } from './stream-deck.controller'

@Module({
  imports: [CommandsModule, DeviceModule],
  controllers: [AppleShortcutsController, StreamDeckController],
})
export class PublicApiModule {}
