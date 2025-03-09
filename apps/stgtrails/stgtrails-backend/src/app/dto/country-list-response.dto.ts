import { ApiProperty } from '@nestjs/swagger'

export class CountryListResponseDto {
  @ApiProperty()
  country: string

  @ApiProperty()
  state: string
}
