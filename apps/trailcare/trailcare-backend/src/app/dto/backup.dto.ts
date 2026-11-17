import { ApiProperty } from '@nestjs/swagger'

export class BackupInfoDto {
  @ApiProperty()
  fileName: string

  @ApiProperty()
  sizeBytes: number

  @ApiProperty()
  createdAt: string
}
