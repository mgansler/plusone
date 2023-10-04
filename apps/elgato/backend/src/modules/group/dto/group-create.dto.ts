import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GroupCreateDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false, default: false })
  isRoom: boolean
}
