import { ApiProperty } from '@nestjs/swagger'

export class RoomResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string
}
