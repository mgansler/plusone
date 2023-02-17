import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

import { TagInput } from '@plusone/feeds/shared/types'

export class TagResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string
}

export class TagInputDto implements TagInput {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
