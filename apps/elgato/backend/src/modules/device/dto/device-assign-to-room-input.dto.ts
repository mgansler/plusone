import { ApiProperty } from '@nestjs/swagger'
import { IsInt } from 'class-validator'

export class DeviceAssignToRoomInputDto {
  @ApiProperty()
  @IsInt()
  roomId: number
}
