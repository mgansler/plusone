import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CommandsService } from '../commands/commands.service'

@ApiTags('public', 'apple-shortcuts')
@Controller('/public/apple-shortcuts')
export class AppleShortcutsController {
  constructor(private readonly commandsService: CommandsService) {}

  @ApiOperation({
    operationId: 'triggerAppleShortcutsCommand',
    summary: 'Trigger a predefined command via apple shortcuts.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Command has been executed' })
  @ApiNotFoundResponse({ description: "The provided command doesn't exist" })
  @Post(':hash')
  async triggerCommand(@Param('hash') hash: string) {
    await this.commandsService.executeCommand(hash)
  }
}
