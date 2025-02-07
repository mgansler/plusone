import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUrl } from 'class-validator'

import { TrailAreaBaseDto } from './trail-area-create-base.dto'

export class TrailAreaCreateFromUrlDto extends TrailAreaBaseDto {
  @ApiProperty({ example: 'https://maps.app.goo.gl/bPvKchfbcaYH8CbP9' })
  @IsUrl()
  mapsShortUrl: string

  @IsOptional()
  threshold?: number
}
