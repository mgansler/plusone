import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class DeviceAddToGroupRequestDto {
  @ApiProperty()
  @IsInt()
  groupId: number
}
