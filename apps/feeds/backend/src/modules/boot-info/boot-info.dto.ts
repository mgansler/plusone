import { ApiProperty } from '@nestjs/swagger'

export class BootInfoDto {
  @ApiProperty()
  pageSize: number
}
