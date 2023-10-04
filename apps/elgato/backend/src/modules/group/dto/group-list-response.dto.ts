import { ApiProperty } from '@nestjs/swagger'

import { GroupResponseDto } from './group-response.dto'

export class GroupListResponseDto {
  @ApiProperty({ type: [GroupResponseDto] })
  groups: GroupResponseDto[]
}
