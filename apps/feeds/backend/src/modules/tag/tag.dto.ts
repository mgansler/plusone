import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class TagResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string
}

export class TagInputDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
