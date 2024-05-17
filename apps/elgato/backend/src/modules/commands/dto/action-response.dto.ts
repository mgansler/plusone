import { ApiProperty } from '@nestjs/swagger'

import { ActionRequestDto } from './action-request.dto'

export class ActionResponseDto extends ActionRequestDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  commandId: number
}
