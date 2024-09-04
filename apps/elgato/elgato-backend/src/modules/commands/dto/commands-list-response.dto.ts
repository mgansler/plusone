import { ApiProperty } from '@nestjs/swagger'

import { CommandResponseDto } from './command-response.dto'

export class CommandsListResponseDto {
  @ApiProperty({ type: () => [CommandResponseDto] })
  commands: Array<CommandResponseDto>
}
