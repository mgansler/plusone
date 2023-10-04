import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class DeviceAddToGroupInputDto {
  @ApiProperty()
  @IsInt()
  groupId: number
}
