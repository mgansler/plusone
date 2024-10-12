import { ApiProperty } from '@nestjs/swagger'

export class TrailUpdateDto {
  @ApiProperty()
  name: string
}
