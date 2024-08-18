import { ApiProperty } from '@nestjs/swagger'

export class TrailCreateDto {
  @ApiProperty()
  name: string
}
