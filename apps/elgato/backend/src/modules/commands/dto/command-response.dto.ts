import { ApiProperty } from '@nestjs/swagger'

import { CommandRequestDto } from './command-request.dto'

export class CommandResponseDto extends CommandRequestDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  hash: string
}
