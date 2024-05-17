import { ApiProperty } from '@nestjs/swagger'

import { ActionResponseDto } from './action-response.dto'
import { CommandRequestDto } from './command-request.dto'

export class CommandResponseDto extends CommandRequestDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  hash: string

  @ApiProperty({ type: () => [ActionResponseDto] })
  actions: Array<ActionResponseDto>
}
