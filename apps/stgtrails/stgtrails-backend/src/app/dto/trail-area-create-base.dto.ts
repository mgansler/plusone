import { ApiProperty } from '@nestjs/swagger'
import { Length, Max, Min } from 'class-validator'

export class TrailAreaBaseDto {
  @ApiProperty({ example: 'Whistler' })
  @Length(1)
  name: string

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.33, required: false })
  @Min(0)
  @Max(1)
  threshold?: number
}
