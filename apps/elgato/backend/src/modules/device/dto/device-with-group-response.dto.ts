import { ApiProperty } from '@nestjs/swagger'

import { GroupResponseDto } from '../../group/dto/group-response.dto'

import { DeviceResponseDto } from './device-response'

export class DeviceWithGroupResponseDto extends DeviceResponseDto {
  @ApiProperty({ type: () => [GroupResponseDto] })
  groups: GroupResponseDto[]
}
