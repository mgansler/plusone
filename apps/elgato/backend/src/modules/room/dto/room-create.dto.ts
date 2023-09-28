import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class RoomCreateDto {
  @ApiProperty()
  @IsString()
  name: string
}
