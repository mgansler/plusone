import { ApiProperty } from '@nestjs/swagger'

export class GroupResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string
}
