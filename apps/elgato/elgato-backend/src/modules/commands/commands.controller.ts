import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { ZodPipe } from '../../app/zod.pipe'

import { CommandsService } from './commands.service'
import { CommandRequestDto, commandRequestSchema } from './dto/command-request.dto'
import { CommandResponseDto } from './dto/command-response.dto'
import { CommandsListResponseDto } from './dto/commands-list-response.dto'

@ApiTags('internal', 'commands')
@Controller('/commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @ApiOperation({ operationId: 'createCommand' })
  @Post()
  async createCommand(
    @Body(new ZodPipe(commandRequestSchema)) commandRequest: CommandRequestDto,
  ): Promise<CommandResponseDto> {
    return this.commandsService.createCommand(commandRequest)
  }

  @ApiOperation({ operationId: 'getCommands' })
  @ApiOkResponse({ type: CommandsListResponseDto })
  @Get()
  async getCommands(): Promise<CommandsListResponseDto> {
    return this.commandsService.getCommands()
  }

  @ApiOperation({ operationId: 'getCommand' })
  @ApiOkResponse({ type: CommandResponseDto })
  @Get(':commandId')
  async getCommand(@Param('commandId', ParseIntPipe) commandId: number): Promise<CommandResponseDto> {
    return this.commandsService.getCommand(commandId)
  }

  @ApiOperation({ operationId: 'updateCommand' })
  @Put(':commandId')
  async updateCommand(
    @Param('commandId', ParseIntPipe) commandId: number,
    @Body(new ZodPipe(commandRequestSchema)) commandRequest: CommandRequestDto,
  ): Promise<CommandResponseDto> {
    return this.commandsService.updateCommand(commandId, commandRequest)
  }

  @ApiOperation({ operationId: 'deleteCommand' })
  @Delete(':commandId')
  async deleteCommand(@Param('commandId', ParseIntPipe) commandId: number) {
    return this.commandsService.deleteCommand(commandId)
  }
}
