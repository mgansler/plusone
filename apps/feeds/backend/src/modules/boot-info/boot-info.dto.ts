import { ApiProperty } from '@nestjs/swagger'

export class BootInfoDto {
  @ApiProperty({ pattern: '\\d\\.\\d' })
  appVersion: string

  @ApiProperty()
  pageSize: number
}
