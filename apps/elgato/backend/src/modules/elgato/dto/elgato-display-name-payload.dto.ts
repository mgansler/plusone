import { ApiProperty } from '@nestjs/swagger'

export class ElgatoDisplayNamePayloadDto {
  @ApiProperty()
  displayName: string
}
