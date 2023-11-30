import { ApiProperty } from '@nestjs/swagger'

export class ElgatoAccessoryInfoResponseDto {
  @ApiProperty()
  productName: string

  @ApiProperty()
  displayName: string
}
